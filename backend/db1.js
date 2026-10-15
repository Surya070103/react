const mysql = require("mysql2/promise");
const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "surya123",
    database: "parking_db"
});
async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log("MySQL database connected successfully!");
        connection.release();
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
}

testConnection();

module.exports = db;