const http = require("http");

const server = http.createServer((req, res) => {
    console.log("URL:", req.url);
    console.log("Method:", req.Method);

    res.end("request recieved");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});

