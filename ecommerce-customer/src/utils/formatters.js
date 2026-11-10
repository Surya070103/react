export const formatInr = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount)

export const getPaymentMethodLabel = (paymentMethod) => ({
  cash_on_delivery: 'Cash on delivery',
  upi: 'UPI',
  credit_debit_card: 'Credit/debit card',
  net_banking: 'Net banking',
  digital_wallet: 'Digital wallets',
  online: 'Online payment (legacy selection)',
}[paymentMethod] || 'Unknown payment option')

export const getOrderStatusLabel = (status) => status === 'cancelled' ? 'Cancelled' : 'Placed'
