import { useState, useEffect } from 'react';
import { ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subtask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  assignedAgent: {
    id: string;
    name: string;
  } | null;
  _count: {
    attempts: number;
    comments: number;
  };
}

interface SubtasksData {
  parent: {
    id: string;
    title: string;
    status: string;
  };
  subtasks: Subtask[];
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

interface TicketSubtasksProps {
  ticketId: string;
  onUpdate?: () => void;
}

export function TicketSubtasks({ ticketId, onUpdate }: TicketSubtasksProps) {
  const [data, setData] = useState<SubtasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchSubtasks();
  }, [ticketId]);

  const fetchSubtasks = async () => {
    try {
      const response = await fetch(`/api/v1/tickets/${ticketId}/subtasks`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch subtasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSubtask = async () => {
    if (!newSubtask.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      await fetch(`/api/v1/tickets/${ticketId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubtask),
      });

      setNewSubtask({ title: '', description: '', priority: 'MEDIUM' });
      setShowAddForm(false);
      fetchSubtasks();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to create subtask:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED' || status === 'CLOSED') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING_REVIEW: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-gray-600',
      MEDIUM: 'text-blue-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return <div className="text-center py-4">Loading subtasks...</div>;
  }

  if (!data) {
    return <div className="text-center py-4 text-gray-500">Failed to load subtasks</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Subtasks ({data.progress.completed}/{data.progress.total})
          </h3>
          {data.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${data.progress.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {data.progress.percentage}%
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Subtask
        </button>
      </div>

      {/* Add subtask form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded border space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={newSubtask.title}
              onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
              placeholder="Enter subtask title"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newSubtask.description}
              onChange={(e) =>
                setNewSubtask({ ...newSubtask, description: e.target.value })
              }
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={newSubtask.priority}
              onChange={(e) =>
                setNewSubtask({ ...newSubtask, priority: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createSubtask}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Subtask
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subtasks list */}
      {data.subtasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No subtasks yet</p>
          <p className="text-sm mt-1">Click "Add Subtask" to break down this ticket</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.subtasks.map((subtask) => (
            <Link
              key={subtask.id}
              to={`/tickets/${subtask.id}`}
              className="block p-4 bg-white border rounded hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(subtask.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-gray-900">{subtask.title}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                        subtask.status
                      )}`}
                    >
                      {subtask.status}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                      {subtask.priority}
                    </span>
                  </div>
                  {subtask.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {subtask.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {subtask.assignedAgent && (
                      <span>👤 {subtask.assignedAgent.name}</span>
                    )}
                    <span>💬 {subtask._count.comments} comments</span>
                    <span>🔄 {subtask._count.attempts} attempts</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
