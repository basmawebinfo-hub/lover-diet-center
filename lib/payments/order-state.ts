// Order state machine — pure functions, no I/O.

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"

export type PaymentStatus =
  | null
  | "initiated"
  | "paid"
  | "failed"
  | "refunded"

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
}

/** Whether an order can transition from `from` -> `to`. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  const allowed = TRANSITIONS[from] ?? []
  return allowed.includes(to)
}

/** Whether a Pay button should be shown / a payment attempt is allowed. */
export function canPay(order: {
  status: OrderStatus
  paymentStatus: PaymentStatus
}): boolean {
  if (order.status !== "pending") return false
  if (order.paymentStatus === "paid") return false
  return true
}

/** Whether an admin Refund action should be allowed. */
export function canRefund(order: {
  status: OrderStatus
  paymentStatus: PaymentStatus
}): boolean {
  if (order.paymentStatus !== "paid") return false
  return ["paid", "processing", "shipped", "delivered"].includes(order.status)
}

/** Whether a Cancel action should be allowed (pre-payment only). */
export function canCancel(order: {
  status: OrderStatus
  paymentStatus: PaymentStatus
}): boolean {
  if (order.status !== "pending") return false
  if (order.paymentStatus === "paid") return false
  return true
}
