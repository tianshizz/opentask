"""Data models for Opentask SDK"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TicketStatus(str, Enum):
    """Ticket status enumeration"""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    WAITING_REVIEW = "WAITING_REVIEW"
    NEEDS_REVISION = "NEEDS_REVISION"
    COMPLETED = "COMPLETED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class TicketPriority(str, Enum):
    """Ticket priority enumeration"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class AttemptStatus(str, Enum):
    """Attempt status enumeration"""
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"
    ABORTED = "ABORTED"


class ActorType(str, Enum):
    """Actor type enumeration"""
    HUMAN = "HUMAN"
    AGENT = "AGENT"


class Actor(BaseModel):
    """Actor model (Human or Agent)"""
    id: str
    type: ActorType
    name: str
    email: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Attempt(BaseModel):
    """Attempt model"""
    id: str
    ticket_id: str
    attempt_number: int
    agent_id: str
    status: AttemptStatus
    reasoning: Optional[str] = None
    outcome: Optional[str] = None
    error_messages: List[str] = Field(default_factory=list)
    tokens_used: Optional[int] = None
    execution_time_ms: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    # Nested objects
    agent: Optional[Actor] = None
    steps: List[Dict[str, Any]] = Field(default_factory=list)
    artifacts: List[Dict[str, Any]] = Field(default_factory=list)


class Comment(BaseModel):
    """Comment model"""
    id: str
    ticket_id: str
    author_id: str
    content: str
    comment_type: str = "COMMENT"
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Nested objects
    author: Optional[Actor] = None


class Ticket(BaseModel):
    """Ticket model"""
    id: str
    title: str
    description: Optional[str] = None
    status: TicketStatus
    priority: TicketPriority
    tags: List[str] = Field(default_factory=list)
    
    # Assignment
    assigned_agent_id: Optional[str] = None
    created_by_id: str
    
    # Metadata
    agent_metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    
    # Nested objects (populated when fetched with details)
    created_by: Optional[Actor] = None
    assigned_agent: Optional[Actor] = None
    attempts: List[Attempt] = Field(default_factory=list)
    comments: List[Comment] = Field(default_factory=list)

    class Config:
        use_enum_values = True
