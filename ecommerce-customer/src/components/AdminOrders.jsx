import { formatInr, getOrderStatusLabel, getPaymentMethodLabel } from '../utils/formatters'

export default function AdminOrders({ orders, message }) {
  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Store management</p>
          <h1>Orders</h1>
        </div>
      </div>
      {message && <p className="storage-message" role="alert">{message}</p>}
      {orders.length === 0 ? (
        <p className="wishlist-empty">No submitted orders yet. Customer carts appear here after an order is placed.</p>
      ) : (
        <div className="admin-order-table-wrap">
          <table className="admin-order-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col">Delivery address</th>
                <th scope="col">Payment option</th>
                <th scope="col">Items</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <th scope="row">#{order.id.slice(0, 8)}</th>
                  <td>
                    <strong>{order.customerName}</strong>
                    <span className="admin-order-customer-email">{order.customerEmail || 'No email provided'}</span>
                  </td>
                  <td>{new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(order.createdAt))}</td>
                  <td>{getOrderStatusLabel(order.status)}</td>
                  <td>{order.shippingAddress || 'Not provided'}</td>
                  <td>{getPaymentMethodLabel(order.paymentMethod)}</td>
                  <td>
                    <ul className="admin-order-items">
                      {order.items.map((item) => (
                        <li key={item.productId}>{item.name} × {item.quantity} — {formatInr(item.price * item.quantity)}</li>
                      ))}
                    </ul>
                  </td>
                  <td><strong className="product-price">{formatInr(order.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
