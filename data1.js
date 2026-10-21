const http = require("http");

const server = http.createServer((req, res) => {
    res.end("Hello from node js");
});

server.listen(4000, () => {

});