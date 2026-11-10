import { formatInr, getOrderStatusLabel, getPaymentMethodLabel } from '../utils/formatters'

export default function CustomerOrders({
  orders,
  products = [],
  message,
  customerName,
  cancellingOrderId,
  onContinueShopping,
  onCancelOrder,
}) {
  const productMap = new Map((products || []).map((product) => [String(product.id), product]))

  return (
    <section className="products-section wishlist-section customer-orders-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your purchases</p>
          <h1>Orders</h1>
          <p className="customer-orders-intro">Orders for {customerName || 'you'}</p>
        </div>
        <button className="shop-button wishlist-back" type="button" onClick={onContinueShopping}>
          Continue shopping
        </button>
      </div>
      {message && <p className="storage-message" role="alert">{message}</p>}
      {orders.length === 0 ? (
        <p className="wishlist-empty">You haven’t placed any orders yet.</p>
      ) : (
        <div className="customer-order-list">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt)
            const formattedDate = Number.isNaN(orderDate.getTime())
              ? 'Date unavailable'
              : new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(orderDate)

            return (
              <div className="customer-order-card" key={order.id}>
                <details>
                  <summary className="customer-order-summary">
                    <span className="customer-order-main">
                      <span className="customer-order-id">Order #{order.id.slice(0, 8)}</span>
                      <span className="customer-order-date">{formattedDate}</span>
                    </span>
                    <span className={`customer-order-status${order.status === 'cancelled' ? ' is-cancelled' : ''}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <span className="customer-order-meta">
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      <strong>{formatInr(order.total)}</strong>
                    </span>
                    <span className="customer-order-toggle" aria-hidden="true" />
                  </summary>
                  <div className="customer-order-details">
                    <h2>Items</h2>
                    <ul className="customer-order-items">
                      {order.items.map((item) => {
                        const product = productMap.get(String(item.productId))
                        const productImage = product?.image || '/images/everyday-shirt.png'

                        return (
                          <li key={item.productId}>
                            <div className="customer-order-item-main">
                              <img
                                className="customer-order-item-image"
                                src={productImage}
                                alt={item.name}
                              />
                              <span className="customer-order-item-name">
                                {item.name}
                                <span className="customer-order-quantity">× {item.quantity}</span>
                              </span>
                            </div>
                            <strong>{formatInr(item.price * item.quantity)}</strong>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="customer-order-info">
                      <div>
                        <h3>Delivery address</h3>
                        <p>{order.shippingAddress || 'Not provided'}</p>
                      </div>
                      <div>
                        <h3>Payment option</h3>
                        <p>{getPaymentMethodLabel(order.paymentMethod)}</p>
                      </div>
                    </div>
                  </div>
                </details>
                {order.status !== 'cancelled' && (
                  <div className="customer-order-actions">
                    <button
                      className="customer-order-cancel"
                      type="button"
                      disabled={cancellingOrderId !== null}
                      onClick={() => onCancelOrder(order)}
                    >
                      {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel order'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
