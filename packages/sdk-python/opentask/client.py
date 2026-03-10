"""Main client for Opentask SDK"""

import requests
from typing import Optional, List, Dict, Any, ContextManager
from contextlib import contextmanager
from .models import Ticket, Attempt, Comment, Actor, TicketStatus, TicketPriority, AttemptStatus


class AttemptContext:
    """Context manager for creating and managing an attempt"""
    
    def __init__(self, client: 'OpentaskClient', ticket_id: str, agent_id: str):
        self.client = client
        self.ticket_id = ticket_id
        self.agent_id = agent_id
        self.attempt_id: Optional[str] = None
        self.attempt: Optional[Attempt] = None
    
    def __enter__(self) -> 'AttemptContext':
        """Start a new attempt"""
        response = self.client._post(
            "/attempts",
            json={
                "ticketId": self.ticket_id,
                "agentId": self.agent_id,
                "reasoning": "Starting attempt",
            }
        )
        self.attempt = Attempt(**response)
        self.attempt_id = self.attempt.id
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Complete the attempt"""
        if exc_type is not None:
            # Exception occurred, mark as failed
            self.complete(
                outcome=f"Failed with error: {str(exc_val)}",
                status=AttemptStatus.FAILED
            )
        return False
    
    def log_step(self, action: str, input_data: Optional[Dict[str, Any]] = None, 
                 output_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Log a step in the attempt"""
        return self.client._post(
            f"/attempts/{self.attempt_id}/steps",
            json={
                "action": action,
                "input": input_data,
                "output": output_data,
            }
        )
    
    def add_artifact(self, name: str, content: str, artifact_type: str = "file") -> Dict[str, Any]:
        """Add an artifact to the attempt (simplified - no actual file upload in MVP)"""
        # In MVP, we just log this as metadata
        return self.log_step(
            f"Generated artifact: {name}",
            output_data={"artifact_name": name, "artifact_type": artifact_type}
        )
    
    def complete(self, outcome: str, status: AttemptStatus = AttemptStatus.SUCCESS,
                 confidence: Optional[float] = None) -> Attempt:
        """Mark the attempt as complete"""
        response = self.client._post(
            f"/attempts/{self.attempt_id}/complete",
            json={
                "outcome": outcome,
                "status": status.value,
            }
        )
        return Attempt(**response)


class TicketProxy:
    """Proxy object for interacting with a ticket"""
    
    def __init__(self, client: 'ClawTicksClient', ticket: Ticket):
        self.client = client
        self.ticket = ticket
        self._id = ticket.id
    
    @property
    def id(self) -> str:
        return self._id
    
    @property
    def status(self) -> TicketStatus:
        return self.ticket.status
    
    def refresh(self) -> 'TicketProxy':
        """Refresh ticket data from server"""
        self.ticket = self.client.get_ticket(self._id)
        return self
    
    def attempt(self) -> AttemptContext:
        """Create a new attempt context"""
        # Use the agent from client config
        agent_id = self.client.agent_id or self.ticket.assigned_agent_id
        if not agent_id:
            raise ValueError("No agent ID specified")
        return AttemptContext(self.client, self._id, agent_id)
    
    def update_status(self, status: TicketStatus, reason: Optional[str] = None) -> Ticket:
        """Update ticket status"""
        response = self.client._patch(
            f"/tickets/{self._id}/status",
            json={"status": status.value, "reason": reason}
        )
        self.ticket = Ticket(**response)
        return self.ticket
    
    def request_review(self, message: str) -> Ticket:
        """Request human review"""
        response = self.client._post(
            f"/tickets/{self._id}/request-review",
            json={"message": message}
        )
        self.ticket = Ticket(**response)
        return self.ticket
    
    def add_comment(self, content: str, comment_type: str = "AGENT_UPDATE") -> Comment:
        """Add a comment to the ticket"""
        response = self.client._post(
            "/comments",
            json={
                "ticketId": self._id,
                "authorId": self.client.agent_id,
                "content": content,
                "type": comment_type,
            }
        )
        return Comment(**response)
    
    def get_attempts(self) -> List[Attempt]:
        """Get all attempts for this ticket"""
        response = self.client._get(f"/attempts/ticket/{self._id}")
        return [Attempt(**a) for a in response]
    
    def get_comments(self) -> List[Comment]:
        """Get all comments for this ticket"""
        response = self.client._get(f"/comments/ticket/{self._id}")
        return [Comment(**c) for c in response]


class OpentaskClient:
    """Main client for interacting with Opentask API"""
    
    def __init__(
        self,
        api_url: str = "http://localhost:3000",
        api_key: Optional[str] = None,
        agent_id: Optional[str] = None,
    ):
        """
        Initialize the Opentask client
        
        Args:
            api_url: Base URL of the Opentask API
            api_key: API key for authentication (optional for MVP)
            agent_id: Default agent ID for operations
        """
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.agent_id = agent_id
        self.base_url = f"{self.api_url}/api/v1"
        
        self.session = requests.Session()
        if api_key:
            self.session.headers["X-API-Key"] = api_key
        if agent_id:
            self.session.headers["X-Agent-ID"] = agent_id
    
    def _get(self, path: str, **kwargs) -> Any:
        """Make a GET request"""
        url = f"{self.base_url}{path}"
        response = self.session.get(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def _post(self, path: str, **kwargs) -> Any:
        """Make a POST request"""
        url = f"{self.base_url}{path}"
        response = self.session.post(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def _patch(self, path: str, **kwargs) -> Any:
        """Make a PATCH request"""
        url = f"{self.base_url}{path}"
        response = self.session.patch(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def _delete(self, path: str, **kwargs) -> Any:
        """Make a DELETE request"""
        url = f"{self.base_url}{path}"
        response = self.session.delete(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    # Ticket operations
    
    def create_ticket(
        self,
        title: str,
        description: Optional[str] = None,
        priority: TicketPriority = TicketPriority.MEDIUM,
        tags: Optional[List[str]] = None,
        assigned_agent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> TicketProxy:
        """Create a new ticket"""
        response = self._post(
            "/tickets",
            json={
                "title": title,
                "description": description,
                "priority": priority.value,
                "tags": tags or [],
                "assignedAgentId": assigned_agent_id or self.agent_id,
                "agentMetadata": metadata or {},
            }
        )
        ticket = Ticket(**response)
        return TicketProxy(self, ticket)
    
    def get_ticket(self, ticket_id: str) -> Ticket:
        """Get a ticket by ID"""
        response = self._get(f"/tickets/{ticket_id}")
        return Ticket(**response)
    
    def list_tickets(
        self,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        assigned_agent_id: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """List tickets with optional filters"""
        params = {"page": page, "limit": limit}
        if status:
            params["status"] = status.value
        if priority:
            params["priority"] = priority.value
        if assigned_agent_id:
            params["assignedAgentId"] = assigned_agent_id
        
        response = self._get("/tickets", params=params)
        response["data"] = [Ticket(**t) for t in response["data"]]
        return response
    
    # Actor operations
    
    def create_agent(self, name: str, email: Optional[str] = None,
                    metadata: Optional[Dict[str, Any]] = None) -> Actor:
        """Create a new agent actor"""
        response = self._post(
            "/actors",
            json={
                "name": name,
                "type": "AGENT",
                "email": email,
                "metadata": metadata or {},
            }
        )
        return Actor(**response)
    
    def get_actor(self, actor_id: str) -> Actor:
        """Get an actor by ID"""
        response = self._get(f"/actors/{actor_id}")
        return Actor(**response)
