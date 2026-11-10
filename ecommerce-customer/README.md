# Shop Easy customer app

The React and Vite frontend provides the Shop Easy storefront and admin screens.
For the full project architecture, setup, API, database, and feature guide, see
the [project guide](../README.md).
The backend is TypeScript running on Node.js's built-in HTTP server; it does not
use Express. Start MySQL and the backend before using the frontend.

Start MySQL, then run both apps from the project root (`e commerence website`):

```powershell
npm run dev
```

This starts the backend and frontend together. The backend reads
`ecommerce-backend\.env` and listens on port `3000` by default. It only starts
listening after it connects to MySQL. The Vite development server forwards
`/api` requests to that backend. To run either app separately, use `npm run
backend` or `npm run frontend` in another terminal.

## Customer and admin accounts

Customers can create an account or sign in from the storefront. Checkout and
order history use the signed-in customer account.

Admins open **Administrator sign in** and use the `ADMIN_EMAIL` and
`ADMIN_PASSWORD` configured in `ecommerce-backend\.env`. Admins can manage
products, customers, and all orders. Authentication is enforced by the backend;
the browser does not contain demo passwords or authorization logic.

The storefront saves cart contents and completed orders through the backend.
The backend derives the customer identity from the authenticated session rather
than trusting checkout form values. Configure the backend environment using
`ecommerce-backend\.env.example` before running the apps.

Run frontend checks from this directory:

```powershell
npm test
npm run lint
npm run build
```
