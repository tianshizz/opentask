"""
Opentask Python SDK

A simple and powerful SDK for AI Agents to interact with the Opentask ticket management system.
"""

from .client import OpentaskClient
from .models import Ticket, Attempt, Comment, Actor, TicketStatus, TicketPriority

__version__ = "0.1.0"

__all__ = [
    "OpentaskClient",
    "Ticket",
    "Attempt",
    "Comment",
    "Actor",
    "TicketStatus",
    "TicketPriority",
]
