import Badge from './ui/Badge'
import { statusLabels } from '@/lib/utils'

interface TicketStatusBadgeProps {
  status: string
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  BLOCKED: 'danger',
  WAITING_REVIEW: 'info',
  NEEDS_REVISION: 'warning',
  COMPLETED: 'success',
  CLOSED: 'default',
  CANCELLED: 'default',
}

export default function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status] || 'default'}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </Badge>
  )
}
