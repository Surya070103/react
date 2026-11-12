export const formatInr = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(amount)

export const getDiscountedPrice = (product) => (
  Math.round(product.price * (100 - (product.discountPercent || 0))) / 100
)

export const formatDeliveryDate = (date) => (
  date
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      .format(new Date(`${String(date).slice(0, 10)}T00:00:00`))
    : ''
)

export const getPaymentMethodLabel = (paymentMethod) => ({
  cash_on_delivery: 'Cash on delivery',
  upi: 'UPI',
  credit_debit_card: 'Credit/debit card',
  net_banking: 'Net banking',
  digital_wallet: 'Digital wallets',
  online: 'Online payment (legacy selection)',
}[paymentMethod] || 'Unknown payment option')

export const getOrderStatusLabel = (status) => status === 'cancelled' ? 'Cancelled' : 'Placed'
