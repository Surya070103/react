# E-commerce Backend

TypeScript backend using native Node.js HTTP, TypeORM, and MySQL.

## Structure

- `src/config` — application and environment configuration
- `src/controllers` — HTTP request handlers
- `src/entities` — TypeORM database entities
- `src/migrations` — database migrations
- `src/providers` — external integrations such as email or storage
- `src/repositories` — database access code
- `src/routes` — API route definitions
- `src/scripts` — one-off development and maintenance scripts
- `src/services` — application business logic
- `src/types` — shared TypeScript types
- `src/__tests__` — unit and integration tests

## Run locally

This server uses Node.js's built-in `http` module and TypeScript; it does not
use Express. Start MySQL and copy `.env.example` to `.env`. Configure the
database, a random `AUTH_SECRET` of at least 32 characters, and the admin
credentials before starting the server.
The server connects to the database before listening (port `3000` by default).
Run migrations after configuring `.env` and before the first backend start.

From the project root, start the backend with:

```powershell
npm run migration:run
npm run backend
```

Then start the customer frontend in a second terminal:

```powershell
npm run frontend
```

## Database migrations

Create or update the backend tables, including the customer/admin portal schema:

```powershell
npm run migration:run
```

Undo the latest migration (this drops the tables and columns added by it):

```powershell
npm run migration:revert
```

Set your MySQL credentials in `.env` before running either command.

## Standalone ShopEasy schema and page queries

The complete proposed customer/admin schema is in `sql/schema.sql`, and example
read queries for the portal pages are in `sql/queries.sql`. The schema includes
`users` (customer and admin roles), `products` (including inventory stock),
`categories`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, `addresses`,
`orders`, `order_items`, and `payments`. These cover the tables used by the
dashboard, management pages, product listing, cart, wishlist, checkout, order
list, and customer profile. Order line items use the table name `order_items`.

The schema targets MySQL 8.0.16 or later and uses `password_hash` rather than
storing plaintext passwords. It also uses `transaction_id` (singular) for the
payment gateway reference.

From the workspace root in PowerShell, run the schema script with the MySQL
client installed and available on `PATH`:

```powershell
Get-Content -Raw .\ecommerce-backend\sql\schema.sql | mysql -u root -p
```

Enter the MySQL password when prompted. The script creates `shopeasy_db` if it
does not exist. To run the example queries afterward:

```powershell
Get-Content -Raw .\ecommerce-backend\sql\queries.sql | mysql -u root -p shopeasy_db
```

You can also open either `.sql` file in MySQL Workbench, connect to your MySQL
server, and execute it there. The query examples use sample ID `1`; change it
to the relevant category, order, or signed-in user's ID before running.

The running backend retains its existing API-compatible columns and applies an
additive migration (`AddPortalSchema1730220000000`) to add the missing portal
tables and inventory/category fields without replacing existing account, cart,
or order data. It also backfills categories and cart/order line items from the
legacy columns where possible, and creates pending payment records for existing
orders. Run the migrations using the database configured in `.env`:

```powershell
npm run migration:run
```

The standalone SQL file describes a fresh normalized database; the additive
migration is the safe path for an existing backend database. Back up the
database before running migrations. The SQL files do not create an admin
account.

## User edit and delete

The user API supports record-ID operations:

- `PATCH /api/users/:id` (or `PUT`) updates the user and returns the saved record.
- `DELETE /api/users/:id` removes the record and returns `204 No Content`.
- `GET /api/users/:id` retrieves a record to confirm an update.

For example, update user `1` with `PATCH /api/users/1` and a JSON body such as
`{"name":"Alice Cooper","phoneno":9876543210}`. These requests use the MySQL-backed
repository and persist through TypeORM. The unit tests mock the repository, so they
verify service and route behavior without modifying a real database.

## Database-backed carts and orders

The backend stores carts in `carts` and completed orders in `orders`. The
initial migrations create these tables and the portal migration creates
normalized `cart_items`, `order_items`, and `payments` records alongside the
existing API-compatible JSON order/cart snapshots. A cart is associated with a
random browser cart key; checkout uses the authenticated customer's account
details and stores an order snapshot using prices read from the database.
Checkout also requires a delivery address and records the selected payment option: cash on
delivery, UPI, credit/debit card, net banking, or digital wallet. Payment
options are only recorded; payment processing is not configured.

- `GET /api/carts/:cartKey` retrieves a cart.
- `PUT /api/carts/:cartKey` saves its product IDs and quantities.
- `POST /api/orders` places an order for the authenticated customer.
- `GET /api/orders` returns the caller's orders or all orders to an admin.

Customer accounts register through `/api/auth/register`; passwords must be 8
to 256 characters and are stored as salted scrypt hashes. Login creates an eight-hour, signed,
HttpOnly, SameSite=Lax session cookie. Admin access is provisioned only through
`ADMIN_EMAIL` and `ADMIN_PASSWORD`; admin registration is disabled. Product
management and customer records are admin-only, and customers can only access
their own orders. Use HTTPS in production; the session cookie is marked Secure
when `NODE_ENV=production`. Customers created by the older prototype can set a
password by registering with their existing email address.

If a customer forgets their password, an administrator can use **Customers >
Reset password** to set a new password. Passwords must contain 8 to 256
characters; the backend stores only a salted scrypt hash. The existing password
cannot be viewed or recovered.

The account-role and portal migrations add their columns and tables to an
existing schema. TypeORM synchronization is disabled for the application; run
the migrations explicitly after backing up the database.

Run the backend checks from this directory:

```powershell
npm test -- --runInBand
npm run build
```

## Database integration tests

The integration tests exercise the user and product HTTP APIs against the MySQL
database named `shopeasy_test_db`. Create that dedicated database before running
the tests; the test data source creates its tables but does not drop the schema
or existing rows. The tests remove only records they create.

```sql
CREATE DATABASE IF NOT EXISTS shopeasy_test_db;
```

Set `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USERNAME`, and `TEST_DB_PASSWORD`
when the test database uses different connection settings from the application
database. Run the tests from the backend directory:

```powershell
npm run test:integration
```

Do not point the integration-test database at a production or development
database.
