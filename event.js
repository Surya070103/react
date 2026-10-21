const Eventemitter = require("events");

const emitter = new Eventemitter();

emitter.on("message", () => {
    console.log("message received");
});

emitter.emit("message");