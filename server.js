const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.end("Home page");
    }
    else if (req.url === "/about") {
        res.end("about page");
    }
    else if (req.url === "/contact") {
        res.end("contact page");
    }


    else {
        res.statusCode = 404;
        res.end("Page Not Found");
    }


    server.listen(3000, () => {
        console.log("Server running on port 3000");
    });

});