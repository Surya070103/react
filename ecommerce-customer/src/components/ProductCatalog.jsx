import { formatInr } from '../utils/formatters'

export default function ProductCatalog({
  products,
  filteredProducts,
  priceRange,
  setPriceRange,
  cart,
  wishlist,
  toggleWishlist,
  addToCart,
  openProductDetails,
  productImageClass,
  getProductImage,
  restoreBuiltInImage,
}) {
  return (
    <>
      <section className="hero" id="home">
        <p className="eyebrow">A little something for everyone</p>
        <h1>Find your next favorite.</h1>
        <p>Thoughtful picks for everyday life, all in one easy place.</p>
        <a className="shop-button" href="#products">Explore products</a>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our collection</p>
            <h2>Popular right now</h2>
          </div>
          <p>All prices are in Indian Rupees (INR).</p>
        </div>
        <div className="product-filter">
          <div className="price-range-fields">
            {['min', 'max'].map((bound) => (
              <label key={bound}>
                <span>{bound === 'min' ? 'Minimum price' : 'Maximum price'}</span>
                <span className="price-input-wrap">
                  <span aria-hidden="true">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={priceRange[bound]}
                    onChange={(event) => setPriceRange((current) => ({ ...current, [bound]: event.target.value }))}
                    placeholder="Any"
                    aria-label={`${bound === 'min' ? 'Minimum' : 'Maximum'} price in rupees`}
                  />
                </span>
              </label>
            ))}
          </div>
          <div className="product-filter-summary">
            <p role="status">Showing {filteredProducts.length} of {products.length} products</p>
            {(priceRange.min !== '' || priceRange.max !== '') && (
              <button type="button" onClick={() => setPriceRange({ min: '', max: '' })}>
                Clear price filter
              </button>
            )}
          </div>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img
                    className={productImageClass(product)}
                    src={getProductImage(product)}
                    alt={product.name}
                    onError={(event) => restoreBuiltInImage(event, product)}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductDetails(product.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openProductDetails(product.id)
                      }
                    }}
                  />
                  <button
                    className={`wishlist-button${wishlist.has(product.id) ? ' is-wishlisted' : ''}`}
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={`${wishlist.has(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.has(product.id) ? 'from' : 'to'} wishlist`}
                    aria-pressed={wishlist.has(product.id)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                    </svg>
                  </button>
                  <button
                    className={`add-to-cart-icon${cart.has(product.id) ? ' is-in-cart' : ''}`}
                    type="button"
                    onClick={() => addToCart(product.id)}
                    aria-label={`${cart.has(product.id) ? 'Add another' : 'Add'} ${product.name} to cart${cart.has(product.id) ? `; ${cart.get(product.id)} in cart` : ''}`}
                    title={cart.has(product.id) ? `${cart.get(product.id)} in cart; add another` : 'Add to cart'}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 3h2l2.4 12.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
                      <circle cx="10" cy="20" r="1" />
                      <circle cx="18" cy="20" r="1" />
                    </svg>
                  </button>
                </div>
                <div className="product-details">
                  <div>
                    <p className="product-category">{product.category}</p>
                    <button className="product-title-button" type="button" onClick={() => openProductDetails(product.id)}>
                      {product.name}
                    </button>
                  </div>
                  <p className="product-price">{formatInr(product.price)}</p>
                </div>
                <div className="product-card-footer">
                  <p className="product-description">{product.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="product-filter-empty" role="status">No products match this price range.</p>
        )}
      </section>
    </>
  )
}
