function getData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Data recieved");
        }, 2000);
    });
}

async function main() {
    console.log("starting");
    const result = await getData();
    console.log(result);
    console.log("finished");
}

main();