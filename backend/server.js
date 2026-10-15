const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const allowedFiles = new Set([
    "file.txt",
    "file1.txt",
    "file2.txt",
    "file3.txt",
    "file4.txt"
]);

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === "GET" && url.pathname === "/file") {
        const fileName = url.searchParams.get("name");

        console.log("Requested filename:", fileName);

        if (!fileName) {
            res.writeHead(400, {
                "Content-Type": "text/plain"
            });

            res.end("File name is required");
            return;
        }

        if (!allowedFiles.has(fileName)) {
            res.writeHead(400, {
                "Content-Type": "text/plain; charset=utf-8"
            });
            res.end("Invalid file name");
            return;
        }

        const filePath = path.join(__dirname, "..", "public", "files", fileName);

        console.log("File path:", filePath);

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                console.log("Read error:", err);

                res.writeHead(404, {
                    "Content-Type": "text/plain; charset=utf-8"
                });

                res.end("File not found");
                return;
            }

            console.log("File content:", data);

            res.writeHead(200, {
                "Content-Type": "text/plain; charset=utf-8"
            });

            res.end(data);
        });

        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
});

server.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});