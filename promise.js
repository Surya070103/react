const myPromise = new Promise((resolve, reject) => {
    const success = false;
    if (success) {
        resolve('Operation was successful');
    } else {
        reject('something went wrong');
    }
});

myPromise
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.log(error);
    });