export default function AdminCustomers({
  customers,
  message,
  isLoading,
  isSaving,
  isPasswordResetSaving,
  isFormOpen,
  editingCustomerId,
  resettingCustomerId,
  formMessage,
  passwordResetMessage,
  onToggleForm,
  onCustomerSubmit,
  onPasswordResetSubmit,
  onClosePasswordReset,
  onEditCustomer,
  onStartPasswordReset,
  onDeleteCustomer,
  onCancelEdit,
}) {
  const editingCustomer = customers.find((customer) => customer.id === editingCustomerId)
  const resettingCustomer = customers.find((customer) => customer.id === resettingCustomerId)

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Store management</p>
          <h1>Customers</h1>
        </div>
        <button className="admin-add-button" type="button" disabled={isLoading || isSaving} onClick={onToggleForm}>
          {isFormOpen ? 'Cancel' : 'Add customer'}
        </button>
      </div>
      <p className="customer-demo-notice">
        Customer records are managed in the backend database. Account passwords are not stored in this admin screen.
      </p>
      {message && <p className="storage-message" role="alert">{message}</p>}
      {resettingCustomerId && (
        <form className="admin-product-form" onSubmit={onPasswordResetSubmit}>
          <h2>Reset password for {resettingCustomer?.fullName || 'customer'}</h2>
          <p>Set a new password with 8 to 256 characters. The existing password cannot be viewed.</p>
          {passwordResetMessage && <p className="auth-message" role="status">{passwordResetMessage}</p>}
          <div className="admin-field">
            <label htmlFor="admin-customer-new-password">New password</label>
            <input
              id="admin-customer-new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={256}
              required
            />
          </div>
          <div className="admin-form-actions">
            <button className="login-submit" type="submit" disabled={isPasswordResetSaving}>
              {isPasswordResetSaving ? 'Resetting...' : 'Reset password'}
            </button>
            <button className="admin-cancel-button" type="button" disabled={isPasswordResetSaving} onClick={onClosePasswordReset}>
              Close
            </button>
          </div>
        </form>
      )}
      {isFormOpen && (
        <form className="admin-product-form" key={editingCustomerId || 'new-customer'} onSubmit={onCustomerSubmit}>
          <h2>{editingCustomerId ? 'Edit customer' : 'Add customer'}</h2>
          {formMessage && <p className="auth-message" role="alert">{formMessage}</p>}
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="admin-customer-name">Customer name</label>
              <input id="admin-customer-name" name="name" required defaultValue={editingCustomer?.fullName || ''} />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-customer-email">Email</label>
              <input id="admin-customer-email" name="email" type="email" required defaultValue={editingCustomer?.email || ''} />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-customer-phone">Phone number</label>
              <input id="admin-customer-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={editingCustomer?.phone || ''} />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-customer-status">Customer status</label>
              <select id="admin-customer-status" name="status" required defaultValue={editingCustomer?.status || 'Active'}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="admin-customer-orders">Orders</label>
              <input
                id="admin-customer-orders"
                name="orders"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={editingCustomer?.orders ?? 0}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-customer-actions">Recent activity</label>
              <input id="admin-customer-actions" name="actions" maxLength="255" defaultValue={editingCustomer?.actions || ''} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="login-submit" type="submit" disabled={isSaving}>
              {editingCustomerId ? 'Save changes' : 'Save customer'}
            </button>
            {editingCustomerId && (
              <button className="admin-cancel-button" type="button" disabled={isSaving} onClick={onCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {isLoading ? (
        <p className="wishlist-empty">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="wishlist-empty">No customers yet. Select “Add customer” to create one.</p>
      ) : (
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Orders</th>
                <th scope="col">Joined</th>
                <th scope="col">Recent activity</th>
                <th scope="col">Phone</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <th scope="row">{customer.fullName}</th>
                  <td>{customer.email}</td>
                  <td>
                    <span className={`customer-status customer-status-${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.orders}</td>
                  <td>{new Intl.DateTimeFormat('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(customer.joined))}</td>
                  <td>{customer.actions || '—'}</td>
                  <td>{customer.phone || '—'}</td>
                  <td>
                    <div className="customer-row-actions">
                      <button className="admin-secondary-button" type="button" onClick={() => onEditCustomer(customer)} disabled={isSaving}>
                        Edit
                      </button>
                      <button className="admin-secondary-button" type="button" onClick={() => onStartPasswordReset(customer.id)} disabled={isPasswordResetSaving}>
                        Reset password
                      </button>
                      <button className="admin-delete-button" type="button" onClick={() => onDeleteCustomer(customer.id)} disabled={isSaving}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
