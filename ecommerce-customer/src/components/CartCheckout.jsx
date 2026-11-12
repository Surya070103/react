import { formatDeliveryDate, formatInr, getDiscountedPrice } from '../utils/formatters'

export default function CartCheckout({
  products,
  cart,
  cartCount,
  cartMessage,
  orderMessage,
  orderConfirmation,
  customerName,
  customerEmail,
  isOrderSubmitting,
  onContinueShopping,
  onRemoveOne,
  onPlaceOrder,
  productImageClass,
  getProductImage,
  restoreBuiltInImage,
}) {
  return (
    <section className="products-section wishlist-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your basket</p>
          <h1>Cart</h1>
        </div>
        <button className="shop-button wishlist-back" type="button" onClick={onContinueShopping}>
          Continue shopping
        </button>
      </div>
      {cartMessage && <p className="storage-message" role="alert">{cartMessage}</p>}
      {orderMessage && <p className="storage-message" role="alert">{orderMessage}</p>}
      {orderConfirmation && <p className="storage-message" role="status">{orderConfirmation}</p>}
      {cartCount === 0 ? (
        <p className="wishlist-empty">Your cart is empty. Add products to see them here.</p>
      ) : (
        <div className="cart-list">
          {products.filter((product) => cart.has(product.id)).map((product) => (
            <article className="cart-item" key={product.id}>
              <img
                className={productImageClass(product)}
                src={getProductImage(product)}
                alt={product.name}
                onError={(event) => restoreBuiltInImage(event, product)}
              />
              <div className="cart-item-details">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p>{cart.get(product.id)} × {formatInr(getDiscountedPrice(product))}</p>
                {product.stock < cart.get(product.id) && (
                  <p className="stock-status is-out-of-stock">Only {product.stock} in stock; adjust your cart before checkout.</p>
                )}
                {product.deliveryDate && <p className="delivery-date">Delivery by {formatDeliveryDate(product.deliveryDate)}</p>}
              </div>
              <p className="product-price">{formatInr(getDiscountedPrice(product) * cart.get(product.id))}</p>
              <button className="remove-cart-item" type="button" onClick={() => onRemoveOne(product.id)}>
                Remove one
              </button>
            </article>
          ))}
          <p className="cart-total">
            Total: {formatInr(products.reduce((total, product) => total + getDiscountedPrice(product) * (cart.get(product.id) || 0), 0))}
          </p>
          <form className="admin-product-form" onSubmit={onPlaceOrder}>
            <h2>Checkout</h2>
            <p>Order will be placed for {customerName} ({customerEmail}).</p>
            <div className="admin-form-grid">
              <div className="admin-field admin-description-field">
                <label htmlFor="order-shipping-address">Delivery address</label>
                <textarea
                  id="order-shipping-address"
                  name="shippingAddress"
                  rows={3}
                  maxLength={1000}
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>
            <div className="checkout-payment">
              <p className="checkout-payment-heading">Payment method</p>
              <label className="checkout-payment-choice">
                <input type="checkbox" name="paymentMethod" value="cash_on_delivery" required />
                <span>Cash on delivery</span>
              </label>
            </div>
            <button
              className="login-submit place-order-button"
              type="submit"
              disabled={isOrderSubmitting || products.some((product) => (cart.get(product.id) || 0) > product.stock)}
            >
              {isOrderSubmitting ? 'Saving order...' : 'Place order'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
