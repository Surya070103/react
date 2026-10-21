const fs = require("fs");

fs.readFile("read.txt", "utf8", (err, data) => {
    if (err) {
        console.log("Error:", err);
        return;
    }
    console.log("File content:", data);
});

fs.appendFile("read.txt", "\nI am learning File System.", "utf8", (err) => {
    if (err) {
        console.log("Append Error:", err);
        return;
    }

    console.log("2. Data appended successfully")

    fs.writeFile("read.txt", "I am learning Node.js", "utf8", (err) => {
        if (err) {
            console.log("Write Error:", err);
            return;
        }

        fs.unlink("read.txt", (err) => {
            if (err) {
                console.log("Delete Error:", err);
                return;
            }

            console.log("4. File deleted successfully");
        });
    });
});