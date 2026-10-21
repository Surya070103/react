const http = require("http");

let users = [
    { id: 1, name: "Rahul", age: 24 },
    { id: 2, name: "Arun", age: 25 }
];

const server = http.createServer((req, res) => {

    // GET - Read users
    if (req.method === "GET" && req.url === "/users") {

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(users));
    }

    // POST - Create user
    else if (req.method === "POST" && req.url === "/users") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const newUser = JSON.parse(body);

            newUser.id = users.length + 1;

            users.push(newUser);

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(newUser));
        });
    }

    // PUT - Update user
    else if (req.method === "PUT" && req.url.startsWith("/users/")) {

        const id = parseInt(req.url.split("/")[2]);

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const updatedUser = JSON.parse(body);

            const user = users.find((user) => user.id === id);

            if (!user) {
                res.statusCode = 404;
                res.end("User not found");
                return;
            }

            user.name = updatedUser.name;
            user.age = updatedUser.age;

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(user));
        });
    }

    // DELETE - Delete user
    else if (req.method === "DELETE" && req.url.startsWith("/users/")) {

        const id = parseInt(req.url.split("/")[2]);

        const index = users.findIndex((user) => user.id === id);

        if (index === -1) {
            res.statusCode = 404;
            res.end("User not found");
            return;
        }

        const deletedUser = users.splice(index, 1);

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(deletedUser));
    }

    // Invalid route
    else {
        res.statusCode = 404;
        res.end("Route not found");
    }
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});