import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart3, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ticketsApi } from '@/lib/api'
import TicketStatusBadge from '@/components/TicketStatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import { formatRelativeTime } from '@/lib/utils'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.list({ limit: 50 }),
  })

  const tickets = data?.data.data || []

  // Statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    waitingReview: tickets.filter((t) => t.status === 'WAITING_REVIEW').length,
    completed: tickets.filter((t) => t.status === 'COMPLETED').length,
  }

  // Recent tickets
  const recentTickets = tickets.slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Opentask AI Agent Ticket System Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Total number of tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
            <p className="text-xs text-gray-500 mt-1">Tickets waiting to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-500 mt-1">Being processed by agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully completed tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Link
              to="/tickets"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No tickets yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
                      </div>
                      {ticket.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                      )}
                      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Created {formatRelativeTime(ticket.createdAt)}</span>
                        {ticket.assignedAgent && (
                          <span>· Agent: {ticket.assignedAgent.name}</span>
                        )}
                        {ticket._count && (
                          <>
                            <span>· {ticket._count.attempts} attempts</span>
                            <span>· {ticket._count.comments} comments</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <TicketStatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waiting for Review */}
      {stats.waitingReview > 0 && (
        <Card className="border-purple-100 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-purple-900">Awaiting Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700">
              <span className="font-semibold">{stats.waitingReview}</span> ticket(s) awaiting your review
            </p>
            <Link
              to="/tickets?status=WAITING_REVIEW"
              className="mt-3 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Review Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
