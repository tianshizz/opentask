-- Claw-Ticks Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Actors (Humans and Agents)
CREATE TABLE actors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('human', 'agent')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_actors_type ON actors(type);
CREATE INDEX idx_actors_email ON actors(email) WHERE email IS NOT NULL;

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Assignment
    assigned_agent_id UUID REFERENCES actors(id),
    created_by_id UUID NOT NULL REFERENCES actors(id),
    
    -- Channel integration
    channel_id UUID,
    channel_type VARCHAR(50),
    channel_message_id VARCHAR(255),
    
    -- Hierarchy
    parent_ticket_id UUID REFERENCES tickets(id),
    
    -- Metadata
    agent_metadata JSONB DEFAULT '{}',
    tags VARCHAR(50)[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'open', 'in_progress', 'blocked', 'waiting_review',
        'needs_revision', 'completed', 'closed', 'cancelled'
    )),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_agent ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by_id);
CREATE INDEX idx_tickets_parent ON tickets(parent_ticket_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_tags ON tickets USING GIN(tags);

-- Ticket Dependencies
CREATE TABLE ticket_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    depends_on_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'blocks',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(ticket_id, depends_on_ticket_id),
    CHECK (ticket_id != depends_on_ticket_id)
);

CREATE INDEX idx_ticket_dependencies_ticket ON ticket_dependencies(ticket_id);
CREATE INDEX idx_ticket_dependencies_depends_on ON ticket_dependencies(depends_on_ticket_id);

-- Attempts
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    
    -- Execution info
    agent_id UUID NOT NULL REFERENCES actors(id),
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    
    -- Content
    reasoning TEXT,
    outcome TEXT,
    error_messages TEXT[],
    
    -- Metrics
    tokens_used INTEGER,
    execution_time_ms BIGINT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(ticket_id, attempt_number),
    CONSTRAINT valid_attempt_status CHECK (status IN (
        'running', 'success', 'failed', 'partial', 'aborted'
    ))
);

CREATE INDEX idx_attempts_ticket ON attempts(ticket_id);
CREATE INDEX idx_attempts_agent ON attempts(agent_id);
CREATE INDEX idx_attempts_status ON attempts(status);

-- Attempt Steps
CREATE TABLE attempt_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    
    -- Step info
    action VARCHAR(500) NOT NULL,
    input JSONB,
    output JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(attempt_id, step_number),
    CONSTRAINT valid_step_status CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    ))
);

CREATE INDEX idx_attempt_steps_attempt ON attempt_steps(attempt_id);
CREATE INDEX idx_attempt_steps_status ON attempt_steps(status);

-- Tool Calls
CREATE TABLE tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    step_id UUID REFERENCES attempt_steps(id) ON DELETE SET NULL,
    
    tool_name VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL,
    result JSONB,
    error TEXT,
    
    execution_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tool_calls_attempt ON tool_calls(attempt_id);
CREATE INDEX idx_tool_calls_tool_name ON tool_calls(tool_name);

-- Artifacts
CREATE TABLE artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    
    name VARCHAR(500) NOT NULL,
    artifact_type VARCHAR(100) NOT NULL,
    content_type VARCHAR(100),
    
    -- Storage
    storage_path VARCHAR(1000), -- S3/MinIO path
    size_bytes BIGINT,
    checksum VARCHAR(64),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_artifacts_attempt ON artifacts(attempt_id);
CREATE INDEX idx_artifacts_type ON artifacts(artifact_type);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES actors(id),
    
    content TEXT NOT NULL,
    comment_type VARCHAR(50) NOT NULL DEFAULT 'comment',
    
    -- References
    reply_to_comment_id UUID REFERENCES comments(id),
    mentioned_attempt_id UUID REFERENCES attempts(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_comment_type CHECK (comment_type IN (
        'comment', 'human_feedback', 'agent_update',
        'status_change', 'system_note'
    ))
);

CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_type ON comments(comment_type);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Comment Attachments
CREATE TABLE comment_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    
    filename VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    storage_path VARCHAR(1000),
    size_bytes BIGINT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comment_attachments_comment ON comment_attachments(comment_id);

-- ============================================================================
-- Channel Management
-- ============================================================================

CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Configuration
    config JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_channel_type CHECK (type IN (
        'web_ui', 'slack', 'discord', 'telegram', 'email', 'api'
    ))
);

CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_enabled ON channels(enabled);

-- ============================================================================
-- Access Control
-- ============================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions VARCHAR(100)[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

CREATE TABLE actor_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by_id UUID REFERENCES actors(id),
    
    UNIQUE(actor_id, role_id)
);

CREATE INDEX idx_actor_roles_actor ON actor_roles(actor_id);
CREATE INDEX idx_actor_roles_role ON actor_roles(role_id);

-- ============================================================================
-- Audit & Analytics
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    actor_id UUID REFERENCES actors(id),
    
    -- What
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Details
    changes JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Ticket Metrics (Materialized View)
CREATE MATERIALIZED VIEW ticket_metrics AS
SELECT 
    t.id as ticket_id,
    t.status,
    t.priority,
    COUNT(DISTINCT a.id) as attempt_count,
    SUM(a.tokens_used) as total_tokens_used,
    SUM(a.execution_time_ms) as total_execution_time_ms,
    COUNT(DISTINCT c.id) as comment_count,
    EXTRACT(EPOCH FROM (COALESCE(t.closed_at, NOW()) - t.created_at)) as lifecycle_seconds
FROM tickets t
LEFT JOIN attempts a ON t.id = a.ticket_id
LEFT JOIN comments c ON t.id = c.ticket_id
GROUP BY t.id, t.status, t.priority, t.created_at, t.closed_at;

CREATE UNIQUE INDEX idx_ticket_metrics_ticket ON ticket_metrics(ticket_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON actors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment attempt number
CREATE OR REPLACE FUNCTION set_attempt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attempt_number IS NULL THEN
        SELECT COALESCE(MAX(attempt_number), 0) + 1
        INTO NEW.attempt_number
        FROM attempts
        WHERE ticket_id = NEW.ticket_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_attempt_number_trigger BEFORE INSERT ON attempts
    FOR EACH ROW EXECUTE FUNCTION set_attempt_number();

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Default roles
INSERT INTO roles (name, description, permissions) VALUES
    ('agent', 'AI Agent Role', ARRAY[
        'ticket:create', 'ticket:read', 'ticket:update',
        'attempt:create', 'attempt:read',
        'comment:create', 'comment:read',
        'artifact:create', 'artifact:read'
    ]),
    ('human_reviewer', 'Human Reviewer Role', ARRAY[
        'ticket:read', 'ticket:approve',
        'attempt:read', 'comment:create', 'comment:read'
    ]),
    ('admin', 'Administrator Role', ARRAY[
        'ticket:*', 'attempt:*', 'comment:*',
        'channel:*', 'user:*', 'role:*'
    ]);

-- System actor
INSERT INTO actors (id, type, name, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'agent', 'System', 'system@claw-ticks.local');

COMMENT ON TABLE tickets IS 'Core ticket/task entities managed by AI agents';
COMMENT ON TABLE attempts IS 'Individual execution attempts by agents for completing tickets';
COMMENT ON TABLE attempt_steps IS 'Detailed step-by-step logs within each attempt';
COMMENT ON TABLE artifacts IS 'Files, patches, and other outputs generated during attempts';
COMMENT ON TABLE comments IS 'Human and agent communication on tickets';
