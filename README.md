# ShopEasy E-commerce

ShopEasy is a full-stack e-commerce application with a customer storefront and an administrator portal. Customers can register, sign in, browse products, manage a cart, place orders, and view their orders. Administrators can manage products, customers, and orders.

The backend API and MySQL database are the source of truth for accounts, products, carts, and orders.

## Technology

- **Frontend:** React customer app
- **Backend:** Node.js API
- **Database:** MySQL with TypeORM
- **Testing:** Jest and automated frontend tests

## Project structure

- `ecommerce-customer/` — storefront and administrator UI
- `ecommerce-backend/` — API, database entities, migrations, and tests
- `scripts/dev.js` — starts the frontend and backend for local development

## How the frontend and backend communicate

1. A React page calls a function in the frontend API client.
2. The API client sends a request to an `/api/...` endpoint.
3. During development, Vite forwards requests to the backend at `http://localhost:3000`.
4. The backend handles the request; services apply business rules, and repositories and TypeORM entities access MySQL.
5. The backend returns JSON for the frontend to display.

## Local setup

1. Install Node.js and npm, and make sure MySQL is running.
2. Install the backend and frontend dependencies:

   ```sh
   npm --prefix ecommerce-backend install
   npm --prefix ecommerce-customer install
   ```

3. Configure the backend environment using `ecommerce-backend/.env.example`.
4. Run the database migrations:

   ```sh
   npm run migration:run
   ```

5. Start both apps:

   ```sh
   npm run dev
   ```

6. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The backend normally uses port 3000.
