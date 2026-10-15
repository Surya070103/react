
const http = require("http");
const db = require("./db.js");

const PORT = 3000;

function send(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin":
            "*",
        "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type"
    });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            resolve(body);
        });
        req.on("error", (error) => {
            reject(error);
        });
    });
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = Number(url.pathname.split("/")[2]);

    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("PATH:", url.pathname);
    console.log("USER ID:", userId);

    try {
        if (req.method === "GET" && url.pathname === "/users") {
            const [users] = await db.query(
                "SELECT id, name, description, role_id, gender, age FROM users ORDER BY id DESC"
            );
            send(res, 200, users);
            return;
        }

        if (req.method === "POST" && url.pathname === "/users") {
            const user = JSON.parse(await readBody(req));
            const roleId = Number(user.role_id);
            if (!Number.isInteger(roleId) || roleId < 1) {
                send(res, 400, { error: "A valid role_id is required" });
                return;
            }
            const [result] = await db.execute(
                "INSERT INTO users (name, description, role_id, gender, age) VALUES (?, ?, ?, ?, ?)",
                [user.name, user.description, roleId, user.gender, user.age]
            );
            const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
            send(res, 201, rows[0]);
            return;
        }

        if (["PUT", "DELETE"].includes(req.method) && url.pathname.startsWith("/users/")) {
            if (!Number.isInteger(userId) || userId < 1) {
                send(res, 400, { error: "Invalid user id" });
                return;
            }

            if (req.method === "PUT") {
                const user = JSON.parse(await readBody(req));
                const roleId = Number(user.role_id);
                if (!Number.isInteger(roleId) || roleId < 1) {
                    send(res, 400, { error: "A valid role_id is required" });
                    return;
                }
                const [result] = await db.execute(
                    "UPDATE users SET name = ?, description = ?, role_id = ?, gender = ?, age = ? WHERE id = ?",
                    [user.name, user.description, roleId, user.gender, user.age, userId]
                );
                if (result.affectedRows === 0) {
                    send(res, 404, { error: "User not found" });
                    return;
                }
                const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
                send(res, 200, rows[0]);
                return;
            }


            const [result] = await db.execute("DELETE FROM users WHERE id = ?", [userId]);
            if (result.affectedRows === 0) {
                send(res, 404, { error: "User not found" });
                return;
            }
            send(res, 200, { message: "User deleted" });
            return;
        }

        send(res, 404, { error: "Route not found" });
    } catch (error) {
        console.error("API error:", error.message);
        send(res, error instanceof SyntaxError ? 400 : 500, {
            error: error instanceof SyntaxError ? "Invalid JSON body" : "Database request failed"
        });
    }

});

server.listen(PORT, () => {
    console.log("server running at local host 3000");
});
