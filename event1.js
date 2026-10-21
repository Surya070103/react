const EventEmitter = require("events");
const event = new EventEmitter();
event.on("message", () => {
    console.log("Message received");
});
event.emit("message");
