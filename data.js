const fs = require('fs');

const data = fs.readFileSync('file.txt');
console.log(data);

console.log('This runs after previous file is read');

fs.readFile('file.txt', (err, data) => {
    console.log(data);
});

console.log('This runs immediately, before the file is read');