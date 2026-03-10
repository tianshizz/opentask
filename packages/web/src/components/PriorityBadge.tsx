import Badge from './ui/Badge'
import { priorityLabels } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: string
}

const priorityVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge variant={priorityVariants[priority] || 'default'}>
      {priorityLabels[priority as keyof typeof priorityLabels] || priority}
    </Badge>
  )
}
