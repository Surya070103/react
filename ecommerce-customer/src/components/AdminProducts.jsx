import { formatInr } from '../utils/formatters'

export default function AdminProducts({
  activeView,
  products,
  selectedProduct,
  editingProductId,
  message,
  formMessage,
  onSetActiveView,
  onProductSubmit,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onRequestDeleteProduct,
  productImageClass,
  getProductImage,
  restoreBuiltInImage,
}) {
  const isEditing = activeView === 'admin-editproducts'
  const isAdding = activeView === 'admin-addproducts'
  const isDeleting = activeView === 'admin-deleteproducts'

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Store management</p>
          <h1>{isAdding ? 'Add product' : isEditing ? 'Edit product' : isDeleting ? 'Delete product' : 'Products'}</h1>
        </div>
        {activeView === 'admin-products' && (
          <button className="admin-add-button" type="button" onClick={onAddProduct}>Add product</button>
        )}
      </div>
      {message && <p className="storage-message" role="status">{message}</p>}
      {isAdding || isEditing ? (
        isEditing && !selectedProduct ? (
          <div className="admin-product-form">
            <p className="wishlist-empty">This product could not be found.</p>
            <button className="admin-cancel-button" type="button" onClick={() => onSetActiveView('admin-products')}>
              Back to products
            </button>
          </div>
        ) : (
          <form className="admin-product-form" key={editingProductId || 'new-product'} onSubmit={onProductSubmit}>
            <h2>{editingProductId ? 'Edit product details' : 'Enter product details'}</h2>
            {formMessage && <p className="auth-message" role="alert">{formMessage}</p>}
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="admin-product-name">Product name</label>
                <input id="admin-product-name" name="name" required defaultValue={selectedProduct?.name || ''} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-category">Category</label>
                <input id="admin-product-category" name="category" required defaultValue={selectedProduct?.category || ''} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-price">Price (INR)</label>
                <input id="admin-product-price" name="price" type="number" min="1" step="1" required defaultValue={selectedProduct?.price || ''} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-stock">Stock quantity</label>
                <input id="admin-product-stock" name="stock" type="number" min="0" step="1" required defaultValue={selectedProduct?.stock ?? 0} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-discount">Discount (%)</label>
                <input id="admin-product-discount" name="discountPercent" type="number" min="0" max="100" step="1" required defaultValue={selectedProduct?.discountPercent ?? 0} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-delivery-date">Delivery date</label>
                <input id="admin-product-delivery-date" name="deliveryDate" type="date" defaultValue={selectedProduct?.deliveryDate || ''} />
              </div>
              <div className="admin-field">
                <label htmlFor="admin-product-image">Image URL (optional)</label>
                <input id="admin-product-image" name="image" type="text" defaultValue={selectedProduct?.image || ''} placeholder="Paste an image URL" />
              </div>
              <div className="admin-field admin-description-field">
                <label htmlFor="admin-product-description">Description</label>
                <textarea id="admin-product-description" name="description" rows="3" required defaultValue={selectedProduct?.description || ''} />
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="login-submit" type="submit">{editingProductId ? 'Save changes' : 'Save product'}</button>
              <button className="admin-cancel-button" type="button" onClick={() => onSetActiveView('admin-products')}>
                Cancel
              </button>
            </div>
          </form>
        )
      ) : isDeleting ? (
        <div className="admin-product-form">
          {selectedProduct ? (
            <>
              <h2>Delete {selectedProduct.name}?</h2>
              <p>This action permanently removes the product from the store.</p>
              {formMessage && <p className="auth-message" role="alert">{formMessage}</p>}
              <div className="admin-form-actions">
                <button className="admin-delete-button" type="button" onClick={() => onDeleteProduct(selectedProduct.id)}>
                  Delete product
                </button>
                <button className="admin-cancel-button" type="button" onClick={() => onSetActiveView('admin-products')}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="wishlist-empty">This product could not be found.</p>
              <button className="admin-cancel-button" type="button" onClick={() => onSetActiveView('admin-products')}>
                Back to products
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="admin-product-list">
          {products.length === 0 ? (
            <p className="wishlist-empty">No products yet. Select “Add product” to create one.</p>
          ) : (
            <div className="admin-product-table-wrap">
              <table className="admin-product-table">
                <thead>
                  <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Product</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Discount</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Delivery date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          className={productImageClass(product)}
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(event) => restoreBuiltInImage(event, product)}
                        />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        <p>{product.description}</p>
                      </td>
                      <td>{product.category}</td>
                      <td><strong className="product-price">{formatInr(product.price)}</strong></td>
                      <td>{product.discountPercent || 0}%</td>
                      <td>{product.stock}</td>
                      <td>{product.deliveryDate || 'Not set'}</td>
                      <td className="admin-product-actions">
                        <button className="admin-secondary-button" type="button" onClick={() => onEditProduct(product)}>Edit</button>
                        <button className="admin-delete-button" type="button" onClick={() => onRequestDeleteProduct(product.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
