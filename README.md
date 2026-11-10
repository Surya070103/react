<<<<<<< HEAD
Parking Management System with Role-Based Access Control
A full stack web application built using React.js for the frontend and Node.js for the backend.

Project overview
The Parking Management System is a full-stack web application developed using React.js,Node.js and MySQL.It manages parking operations and control access to application features based on user roles and permissions.

Features
1.User login and authentication
2.Role-based access control
3.Parking records management
4.Vehicle entry and exit management
5.Parking fee calculation
6.Role management
7.Permission management
8.Role-based access control
9.Dynamic sidebar menu based on user permissions.

Technology Stack
1.Frontend:React.js
2.Backend:Node.js
3.Database:MySQL

Project Structure:
1.src/-React frontend code
2.public/- Public frontend assets
3.backend/- Node.js backend code

=======
# Shop Easy E-commerce Project Guide

This guide explains the whole project: how to run it, how the frontend and
backend communicate, where the main features live, and how the database and
tests are organized.

## What this project does

Shop Easy is a full-stack store with a React customer storefront and an
administrator portal. Customers can browse products, create an account, sign
in, save a cart, and place orders. Administrators can manage products,
customers, and orders.

The browser app is not the source of truth for accounts, products, carts, or
orders. Those operations use the backend API and MySQL database. The wishlist
is currently held in frontend state and is not saved across page reloads.

## Project layout

```text
.
|-- package.json                   Root development and test commands
|-- scripts/
|   `-- dev.js                     Starts frontend and backend together
|-- ecommerce-customer/
|   |-- src/App.jsx                Storefront, checkout, admin screens
|   |-- src/services/api.js        Browser-to-backend API client
|   |-- src/App.css                Application styling
|   `-- vite.config.js             Vite development server and API proxy
`-- ecommerce-backend/
    |-- src/app.ts                 HTTP server and request routing
    |-- src/index.ts               Database connection and server startup
    |-- src/config/env.ts          Environment variable configuration
    |-- src/routes/                HTTP routes and access checks
    |-- src/controllers/           Request parsing and HTTP responses
    |-- src/services/              Business rules
    |-- src/repositories/          TypeORM database access
    |-- src/entities/              MySQL table mappings
    |-- src/migrations/            Versioned database schema changes
    |-- src/__tests__/             Unit and database integration tests
    `-- sql/                       Standalone schema and example queries
```

## How a request moves through the system

1. A page in `ecommerce-customer/src/App.jsx` calls a function in
   `ecommerce-customer/src/services/api.js`.
2. The API client sends a request to `/api/...` on the same origin as the
   browser app.
3. During development, Vite forwards `/api` requests to
   `http://localhost:3000` (see `ecommerce-customer/vite.config.js`).
4. The built-in Node.js HTTP server in `ecommerce-backend/src/app.ts` matches
   the request to a route and runs its controller.
5. Services validate input and enforce business rules; repositories use
   TypeORM entities to read or write MySQL.
6. Controllers send JSON responses, which the API client converts into data
   for the React UI.

This backend uses Node.js's built-in `http` module; it does not use Express.
The backend only begins listening after TypeORM successfully connects to MySQL.
If the backend is stopped or cannot connect to its database, Vite will report
`ECONNREFUSED` when it tries to forward API requests.

## Run locally

### Requirements

- Node.js and npm
- MySQL running locally or on a reachable host
- A MySQL database configured in the backend environment

### Install dependencies

Run these commands from the project root:

```powershell
npm --prefix ecommerce-backend install
npm --prefix ecommerce-customer install
```

The root `package.json` is for workspace-level commands. The backend and
frontend each have their own package files and dependencies.

### Configure the backend

Copy the example environment file:

```powershell
Copy-Item .\ecommerce-backend\.env.example .\ecommerce-backend\.env
```

Edit `ecommerce-backend\.env` and set your MySQL credentials, a unique
`AUTH_SECRET` (at least 32 characters), and private admin credentials. For
example, Node.js can generate a random secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The example database name is `ecommerce`. Create that database in MySQL if it
does not already exist, or change `DB_DATABASE` to an existing database you
intend to use. The backend migration command applies the migrations to the
database named by `DB_DATABASE`.

Never commit `.env` or share its secrets. Only `.env.example`, which contains
placeholders, belongs in source control.

### Apply schema and start

After MySQL and the configured database are available, run the migrations:

```powershell
npm run migration:run
```

Then start both applications from the project root:

```powershell
npm run dev
```

The combined command starts the backend first and waits for port `3000` to
accept connections before starting Vite. This prevents initial API proxy
`ECONNREFUSED` errors. If it reports that port `3000` is already in use, stop
the other backend process before retrying.

Open the Vite URL printed in the terminal (normally
`http://localhost:5173/`). The API is normally on port `3000`.

To run applications separately, use two terminals:

```powershell
npm run backend
```

```powershell
npm run frontend
```

Stop development processes with Ctrl+C. The combined `npm run dev` command
stops both child processes when it exits.

### Important environment settings

| Variable | Purpose | Example default |
|---|---|---|
| `PORT` | Backend HTTP port | `3000` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | Set locally |
| `DB_DATABASE` | Application database | `ecommerce` |
| `AUTH_SECRET` | Signs session tokens; must be at least 32 characters | Generate locally |
| `ADMIN_EMAIL` | Configured administrator login email | Set locally |
| `ADMIN_PASSWORD` | Configured administrator login password | Set locally |

The database integration tests use a separate database named
`shopeasy_test_db`. Their optional `TEST_DB_HOST`, `TEST_DB_PORT`,
`TEST_DB_USERNAME`, and `TEST_DB_PASSWORD` variables override the normal
connection settings. Never point integration tests at production data.

## Application features and flows

### Customer storefront

- Lists products fetched from `GET /api/products`; product details use
  `GET /api/products/:id`.
- If products cannot be fetched, the frontend can display its built-in sample
  products and shows an error message. This fallback does not mean the backend
  is connected.
- Customers can add products to a browser cart. The browser keeps a cart key in
  local storage and loads/saves the matching cart through the backend.
- A cart item contains a product ID and quantity. The backend checks that the
  product exists, quantities are from 1 through 99, and a product is not
  duplicated in the submitted list.
- Checkout requires a signed-in customer and a delivery address. Cash on
  delivery is the only accepted payment method. The server reads product names
  and prices from the database, creates the order and pending payment record,
  then clears the cart.
- Customers can cancel their own placed orders; cancelled orders remain in
  order history and cannot be cancelled again.
- Payment is recorded only; no online payment provider is connected.
- The wishlist is currently an in-memory frontend feature and is lost on a
  page reload. Although wishlist database entities and tables exist, there are
  no wishlist API routes or persistence flow yet.

### Accounts and authorization

- Customers register with a name, email, phone number, and password. Passwords
  must be 8–256 characters and are stored as salted scrypt hashes.
- Registration only permits the customer role. Admin self-registration is
  disabled.
- An administrator account is provisioned from `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` in the backend environment; it is not stored as a normal
  database user.
- Login creates a signed, HttpOnly, SameSite=Lax session cookie with an
  eight-hour lifetime. The cookie is marked Secure in production.
- The backend checks a customer session against the active database user. The
  administrator session is based on the configured administrator credentials.
- Admin-only endpoints protect product management, customer management, and
  password resets. The customer interface is not a replacement for these
  server-side checks.

### Administrator portal

The admin screens provide product add/edit/delete, customer list and edits,
customer deletion and password reset, and access to orders. Admin APIs are
protected by the `admin` session role.

## HTTP API overview

All endpoints are served by the backend. Development browser requests reach
them through Vite's `/api` proxy.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a customer |
| `POST` | `/api/auth/login` | Public | Sign in and set a session cookie |
| `GET` | `/api/auth/me` | Signed-in session | Return the current user |
| `POST` | `/api/auth/logout` | Public/session cookie | Clear the session cookie |
| `GET` | `/api/products` | Public | List products |
| `GET` | `/api/products/:id` | Public | Read one product |
| `POST` | `/api/products` | Admin | Create a product |
| `PATCH` / `PUT` | `/api/products/:id` | Admin | Update a product |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |
| `GET` | `/api/carts/:cartKey` | Cart key | Read cart contents |
| `PUT` | `/api/carts/:cartKey` | Cart key | Replace cart contents |
| `GET` | `/api/orders` | Signed-in session | List the caller's orders; admins see all |
| `POST` | `/api/orders` | Customer | Place an order from the saved cart |
| `GET` | `/api/users` | Admin | List customers |
| `POST` | `/api/users` | Admin | Create a customer record |
| `GET` | `/api/users/:id` | Admin | Read a customer |
| `PATCH` / `PUT` | `/api/users/:id` | Admin | Update a customer |
| `DELETE` | `/api/users/:id` | Admin | Delete a customer |
| `POST` | `/api/users/:id/password` | Admin | Reset a customer's password |

Order creation expects a JSON body containing `cartKey`, `shippingAddress`,
and `paymentMethod`. The customer ID and identity come from the authenticated
session, not from the request body.

## Database model

The TypeORM entities under `ecommerce-backend/src/entities` map the application
to these tables:

- **users** — customer profile, email, phone, password hash, role, status, and
  order count.
- **products** — product details, category, price, inventory/status, image URL,
  and timestamps.
- **categories** — category names and status.
- **carts** — unique browser cart key and a JSON snapshot of product IDs and
  quantities. **cart_items** also stores normalized cart rows.
- **orders** — customer snapshot, total, JSON item snapshot, shipping address,
  payment method, status, and creation time. **order_items** contains normalized
  order lines.
- **payments** — payment option, pending status, amount, and an optional
  transaction reference.
- **addresses**, **wishlists**, and **wishlist_items** — supporting schema
  entities; address and wishlist persistence are not currently exposed as
  frontend API flows.

Prices in an order are looked up from the database when checkout runs, rather
than trusting prices submitted by the browser. Order data keeps a snapshot of
item names and prices so later product changes do not rewrite the order
contents.

## Database migrations and SQL files

`ecommerce-backend/src/data-source.ts` registers the application entities and
versioned migrations. Run `npm run migration:run` to apply pending migrations.
The migrations build on the existing application schema:

1. `InitialSchema` creates the initial users, products, carts, and orders
   tables.
2. `AddAccountRoles1730200000000` adds password hashes, account roles, and
   product ownership metadata.
3. `AddOrderCheckoutDetails1730210000000` adds shipping address and payment
   method fields to orders.
4. `AddPortalSchema1730220000000` adds category, stock, cart/order line,
   address, wishlist, and payment schema, and backfills compatible existing
   data.
5. `AddOrderCancellation1730230000000` adds the order status used to track
   placed and cancelled orders.

Back up important data before migrations. `npm run migration:revert` reverses
the latest migration and can drop tables or columns introduced by that
migration; use it only when you understand the consequences.

The files under `ecommerce-backend/sql` are a separate standalone SQL reference
for creating/querying a fresh Shop Easy schema. In particular,
`sql/schema.sql` creates `shopeasy_db`, while the TypeORM application defaults
to `ecommerce`. These are not automatically the same database; use the
TypeORM migrations for the running application.

## Tests and checks

Run commands from the project root unless noted:

```powershell
npm test
npm --prefix ecommerce-backend run build
npm --prefix ecommerce-backend run test:integration
npm --prefix ecommerce-customer test
npm --prefix ecommerce-customer run lint
npm --prefix ecommerce-customer run build
```

The backend's default Jest configuration runs unit and route tests and excludes
the database integration folder. The integration suite uses the separate
`shopeasy_test_db` database configured in `ecommerce-backend/src/test-data-source.ts`.
Create and verify that dedicated test database before running integration
tests. Frontend tests use Node's built-in test runner.

## Where to make changes

- **Storefront layout, state, checkout, and admin pages:** `ecommerce-customer/src/App.jsx`
- **Browser API requests and response mapping:** `ecommerce-customer/src/services/api.js`
- **Vite `/api` proxy:** `ecommerce-customer/vite.config.js`
- **HTTP server and top-level request flow:** `ecommerce-backend/src/app.ts`
- **Route matching and role checks:** `ecommerce-backend/src/routes`
- **Input validation and business behavior:** `ecommerce-backend/src/services`
- **Database queries:** `ecommerce-backend/src/repositories`
- **Database columns and mapping:** `ecommerce-backend/src/entities`
- **Schema changes:** `ecommerce-backend/src/migrations`
- **Environment variable parsing:** `ecommerce-backend/src/config/env.ts`
- **Backend tests:** `ecommerce-backend/src/__tests__`
- **Frontend API tests:** `ecommerce-customer/src/services/api.test.js`

## Current limitations

- Online payment is not processed; checkout supports cash on delivery only and
  records a pending payment.
- Wishlist state is not persisted to the backend or across reloads.
- Address and wishlist schema exists, but corresponding customer CRUD APIs are
  not implemented.
- Product fallback data can keep the storefront visible when the API is down,
  but cart saving, authentication, and checkout still require the backend and
  database to be available.
>>>>>>> b15b1d2 (Initial commit)
