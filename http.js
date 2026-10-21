const http = require("http");

let users = [
    { id: 1, name: "Rahul", age: 24 },
    { id: 2, name: "Arun", age: 25 }
];

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json");


    if (req.method === "GET" && req.url === "/users") {

        res.end(JSON.stringify(users));
    }


    else if (req.method === "POST" && req.url === "/users") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const newUser = JSON.parse(body);

            newUser.id = users.length + 1;

            users.push(newUser);

            res.statusCode = 201;
            res.end(JSON.stringify(newUser));
        });
    }


    else if (req.method === "PUT" && req.url === "/users") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const updatedUser = JSON.parse(body);

            const user = users.find(
                user => user.id === updatedUser.id
            );

            if (!user) {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    message: "User not found"
                }));
                return;
            }

            user.name = updatedUser.name;
            user.age = updatedUser.age;

            res.end(JSON.stringify(user));
        });
    }

    // DELETE - DELETE
    else if (req.method === "DELETE" && req.url === "/users") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            const data = JSON.parse(body);

            const index = users.findIndex(
                user => user.id === data.id
            );

            if (index === -1) {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    message: "User not found"
                }));
                return;
            }

            const deletedUser = users.splice(index, 1);

            res.end(JSON.stringify({
                message: "User deleted",
                user: deletedUser[0]
            }));
        });
    }

    else {
        res.statusCode = 404;
        res.end(JSON.stringify({
            message: "Route not found"
        }));
    }

});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});