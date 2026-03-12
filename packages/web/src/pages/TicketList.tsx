import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ticketsApi } from '@/lib/api'
import TicketStatusBadge from '@/components/TicketStatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import { formatRelativeTime } from '@/lib/utils'

export default function TicketList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter],
    queryFn: () =>
      ticketsApi.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        limit: 100,
      }),
  })

  const approveMutation = useMutation({
    mutationFn: (ticketId: string) => ticketsApi.approve(ticketId, 'Approved from list'),
    onSuccess: () => {
      // Refresh the ticket list
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  const handleApprove = (e: React.MouseEvent, ticketId: string) => {
    e.preventDefault() // Prevent navigation to detail page
    e.stopPropagation()
    
    approveMutation.mutate(ticketId)
  }

  const tickets = data?.data.data || []

  // Search filter
  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = search.toLowerCase()
    return (
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description?.toLowerCase().includes(searchLower) ||
      ticket.id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Tickets</h2>
          <p className="mt-1 text-sm text-gray-500">
            {filteredTickets.length} Tickets Total
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">AllStatus</option>
                <option value="OPEN">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_REVIEW">Awaiting Review</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">AllPriority</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-gray-500">No tickets found matching the criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                <Card className="transition-all hover:border-gray-200 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                          {ticket.tags && ticket.tags.length > 0 && (
                            <div className="flex gap-1">
                              {ticket.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {ticket.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {ticket.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <span>#{ticket.id.slice(0, 8)}</span>
                          <span>Created {formatRelativeTime(ticket.createdAt)}</span>
                          {ticket.assignedAgent && (
                            <span>Agent: {ticket.assignedAgent.name}</span>
                          )}
                          {ticket._count && (
                            <>
                              <span>{ticket._count.attempts} attempts</span>
                              <span>{ticket._count.comments} comments</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <div className="flex items-center gap-2">
                          <TicketStatusBadge status={ticket.status} />
                          {ticket.status === 'WAITING_REVIEW' && (
                            <button
                              onClick={(e) => handleApprove(e, ticket.id)}
                              disabled={approveMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Approve ticket"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                        </div>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
