
Project Overview
ShopEasy is a full-stack e-commerce application with a customer storefront and an administrator portal. 

Customers can register, sign in, browse products, manage a cart and place orders. Administrators can manage products, customers and
Orders
.
The backend API and MySQL database are the source of truth for accounts, products, carts and orders. 

Products support a discount percentage, stock quantity, and optional delivery date. Checkout calculates the discounted price, saves each item's delivery date with the order, and atomically reserves stock; cancelling an order restores it. Apply the product-offers and order-item delivery-date migrations with the existing migration command.

Technology and Project Structure


Area
Responsibility
React Customer App
Storefront,Checkout and admin UI
API Client
Sends browser requests to backend
Node js HTTP request
Receives requests and matches routes
Routes/Controllers
Route access checks,request handling
Repositories/Entities
TypeORM database access and MySQL table mappings 
Migrations / Tests 
Versioned schema changes and automated checks 



3. How Frontend and Backend Communicate

1.A React page calls a function in the frontend API client.

2.The API client sends a request to an
/api/…
endpoint.

3.Vite forwards the request to the backend at
http://localhost:3000
during development.

4.The Node.js built-in
Http
server matches the route and runs its controller.

5.Services validate data and apply business rules; repositories and TypeORM entities access MySQL.


6.The controller returns JSON, and the frontend uses the response to update the UI


4. Main Application Features 



Customer 
Register and log in; browse product list/details; add items to cart; checkout; view orders. 
Administrator 
Add, edit and delete products; view/edit/delete customers; reset customer passwords; access orders. 


5.Local Setup — Basic Sequence 

1.Install Node.js/npm and make sure MySQL is running.
2.Install backend and frontend dependencies:
npm
--prefix ecommerce-backend install

npm
--prefix ecommerce-customer install

3.Run migrations:
npm run migration:run

4.Start both apps:
npm run dev

5.Open the Vite URL shown in the terminal (normally
http://localhost:5173
). Backend normally uses port 3000.
