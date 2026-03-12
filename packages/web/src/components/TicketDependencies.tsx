import { useState, useEffect } from 'react';
import { Link2, Trash2, AlertCircle, Plus } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Dependency {
  id: string;
  dependsOnTicket: Ticket;
}

interface DependedBy {
  id: string;
  ticket: Ticket;
}

interface TicketDependenciesProps {
  ticketId: string;
  onUpdate?: () => void;
}

export function TicketDependencies({ ticketId, onUpdate }: TicketDependenciesProps) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [dependedOnBy, setDependedOnBy] = useState<DependedBy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDependencyId, setNewDependencyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDependencies();
  }, [ticketId]);

  const fetchDependencies = async () => {
    try {
      const response = await fetch(`/api/v1/tickets/${ticketId}/dependencies`);
      const data = await response.json();
      setDependencies(data.dependencies || []);
      setDependedOnBy(data.dependedOnBy || []);
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDependency = async () => {
    if (!newDependencyId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    setError('');
    try {
      const response = await fetch('/api/v1/tickets/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          dependsOnTicketId: newDependencyId,
          dependencyType: 'blocks',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create dependency');
      }

      setNewDependencyId('');
      setShowAddForm(false);
      fetchDependencies();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeDependency = async (dependencyId: string) => {
    if (!confirm('Remove this dependency?')) return;

    try {
      await fetch(`/api/v1/tickets/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });
      fetchDependencies();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to remove dependency:', err);
    }
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

  if (loading) {
    return <div className="text-center py-4">Loading dependencies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Dependencies
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Dependency
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded border">
          <label className="block text-sm font-medium mb-2">
            Ticket ID this ticket depends on:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDependencyId}
              onChange={(e) => setNewDependencyId(e.target.value)}
              placeholder="Enter ticket ID"
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addDependency}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setError('');
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* This ticket depends on */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Depends On ({dependencies.length})
        </h4>
        {dependencies.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No dependencies</p>
        ) : (
          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 bg-white border rounded hover:shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dep.dependsOnTicket.title}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                        dep.dependsOnTicket.status
                      )}`}
                    >
                      {dep.dependsOnTicket.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {dep.dependsOnTicket.id}
                  </p>
                </div>
                <button
                  onClick={() => removeDependency(dep.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Remove dependency"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tickets that depend on this */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Blocked By This ({dependedOnBy.length})
        </h4>
        {dependedOnBy.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tickets blocked by this</p>
        ) : (
          <div className="space-y-2">
            {dependedOnBy.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 bg-white border rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dep.ticket.title}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                        dep.ticket.status
                      )}`}
                    >
                      {dep.ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID: {dep.ticket.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
