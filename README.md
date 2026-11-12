# ShopEasy

## Project Overview

ShopEasy is a full-stack e-commerce application with a customer storefront and an administrator portal.

Customers can register, sign in, browse products, manage a cart, and place orders. Administrators can manage products, customers, and orders.

The backend API and MySQL database are the source of truth for accounts, products, carts, and orders.



## How Frontend and Backend Communicate

1. A React page calls a function in the frontend API client.
2. The API client sends a request to an `/api/...` endpoint.
3. During development, Vite forwards the request to the backend at `http://localhost:3000`.
4. The Node.js built-in HTTP server matches the route and runs its controller.
5. Services validate data and apply business rules; repositories and TypeORM entities access MySQL.
6. The controller returns JSON, and the frontend uses the response to update the UI.

## Main Application Features

### Customer

Register and log in; browse product lists and details; add items to the cart; check out; and view orders.

### Administrator

Add, edit, and delete products; view, edit, and delete customers; reset customer passwords; and access orders.

## Local Setup

1. Install Node.js/npm and make sure MySQL is running.
2. Install backend and frontend dependencies:

   ```sh
   npm --prefix ecommerce-backend install
   npm --prefix ecommerce-customer install
   ```

3. Run migrations:

   ```sh
   npm run migration:run
   ```

4. Start both apps:

   ```sh
   npm run dev
   ```

5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The backend normally uses port 3000.
