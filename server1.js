const http = require("http");

const fs = require("fs");

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        fs.readFile("read.txt", "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Error reading file");
                return;
            }
            res.end(data);
        });
    } else {
        res.statuscode = 404;
        res.end("Page not found");
    }
});

server.listen(3001, () => {
    console.log("Server running on port 3001");
});
