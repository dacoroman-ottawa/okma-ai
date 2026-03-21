// =============================================================================
// Data Types
// =============================================================================

export interface DashboardMetrics {
  classesToday: number
  studentsEnrolled: number
  activeRentals: number
  lowStockCount: number
}

export type ClassType = 'private' | 'group'

export interface TodaysClass {
  id: string
  time: string
  duration: number
  teacherName: string
  studentNames: string[]
  instrumentName: string
  type: ClassType
}

export interface UpcomingClass {
  id: string
  date: string
  time: string
  duration: number
  teacherName: string
  studentNames: string[]
  instrumentName: string
  type: ClassType
}

export type AlertSeverity = 'low' | 'warning' | 'critical'

export interface CreditAlert {
  id: string
  studentId: string
  studentName: string
  instrumentName: string
  teacherName: string
  currentBalance: number
  severity: AlertSeverity
}

export type InventoryAlertType = 'low_stock' | 'overdue_rental'

export interface InventoryAlert {
  id: string
  type: InventoryAlertType
  productId?: string
  rentalId?: string
  productName: string
  customerName?: string
  currentStock?: number
  reorderLevel?: number
  dueDate?: string
  daysOverdue?: number
  severity: AlertSeverity
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardProps {
  /** Summary metrics for the dashboard header */
  metrics: DashboardMetrics
  /** Classes scheduled for today */
  todaysClasses: TodaysClass[]
  /** Classes scheduled for later this week */
  upcomingClasses: UpcomingClass[]
  /** Students with low or zero credit balances */
  creditAlerts: CreditAlert[]
  /** Low stock products and overdue rentals */
  inventoryAlerts: InventoryAlert[]
  /** Called when user clicks on a class to view details */
  onViewClass?: (id: string) => void
  /** Called when user clicks on a credit alert to view student */
  onViewStudent?: (studentId: string) => void
  /** Called when user clicks on an inventory alert to view product/rental */
  onViewInventoryAlert?: (alertId: string) => void
}
