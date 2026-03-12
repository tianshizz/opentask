import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  MessageSquare,
  Activity,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ticketsApi, attemptsApi, commentsApi, Attempt, Comment } from '@/lib/api'
import TicketStatusBadge from '@/components/TicketStatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [reviewMessage, setReviewMessage] = useState('')

  // Query Ticket Details
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id!),
    enabled: !!id,
  })

  // Query Attempts
  const { data: attempts } = useQuery({
    queryKey: ['attempts', id],
    queryFn: () => attemptsApi.getByTicket(id!),
    enabled: !!id,
  })

  // Query Comments
  const { data: comments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsApi.getByTicket(id!),
    enabled: !!id,
  })

  // Approve Ticket
  const approveMutation = useMutation({
    mutationFn: (message: string) => ticketsApi.approve(id!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setReviewMessage('')
    },
  })

  // Request Revision
  const revisionMutation = useMutation({
    mutationFn: (message: string) => ticketsApi.requestRevision(id!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setReviewMessage('')
    },
  })

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

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    )
  }

  const ticketData = ticket.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-2xl">{ticketData.title}</CardTitle>
              </div>
              <div className="mt-3 flex items-center space-x-3">
                <TicketStatusBadge status={ticketData.status} />
                <PriorityBadge priority={ticketData.priority} />
                <span className="text-xs text-gray-500">#{ticketData.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {ticketData.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticketData.description}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-start space-x-3">
              <User className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Created by</p>
                <p className="text-sm font-medium text-gray-900">
                  {ticketData.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Activity className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Assigned to</p>
                <p className="text-sm font-medium text-gray-900">
                  {ticketData.assignedAgent?.name || 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Created at</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatRelativeTime(ticketData.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Updated at</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatRelativeTime(ticketData.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {ticketData.tags && ticketData.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {ticketData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Section (if waiting for review) */}
      {ticketData.status === 'WAITING_REVIEW' && (
        <Card className="border-purple-100 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-purple-900">Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comment (Optional)
              </label>
              <textarea
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                rows={3}
                placeholder="Add review comment..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => approveMutation.mutate(reviewMessage)}
                disabled={approveMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (reviewMessage.trim()) {
                    revisionMutation.mutate(reviewMessage)
                  } else {
                    alert('Please enter revision comment')
                  }
                }}
                disabled={revisionMutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Attempts ({attempts?.data.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!attempts?.data.length ? (
            <p className="text-sm text-gray-500 py-4">No execution records</p>
          ) : (
            <div className="space-y-4">
              {attempts.data.map((attempt: Attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">
                          Attempt #{attempt.attemptNumber}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            attempt.status === 'SUCCESS'
                              ? 'bg-green-50 text-green-700'
                              : attempt.status === 'FAILED'
                              ? 'bg-red-50 text-red-700'
                              : attempt.status === 'RUNNING'
                              ? 'bg-yellow-50 text-yellow-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </div>
                      {attempt.reasoning && (
                        <p className="mt-1 text-sm text-gray-600">{attempt.reasoning}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {formatDate(attempt.startedAt)}
                    </div>
                  </div>

                  {attempt.outcome && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-700">Outcome:</p>
                      <p className="mt-1 text-sm text-gray-600">{attempt.outcome}</p>
                    </div>
                  )}

                  {attempt.steps && attempt.steps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">Execution Steps:</p>
                      {attempt.steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs">
                          <span className="text-gray-400">#{step.stepNumber}</span>
                          <span className="text-gray-600">{step.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquare className="inline h-5 w-5 mr-2" />
            Comments ({comments?.data.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!comments?.data.length ? (
            <p className="text-sm text-gray-500 py-4">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.data.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{comment.commentType}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
