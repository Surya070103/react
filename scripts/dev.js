const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backendPort = 3000;
const backend = {
  name: "backend",
  cwd: path.join(root, "ecommerce-backend"),
  script: path.join(root, "ecommerce-backend", "node_modules", "ts-node", "dist", "bin.js"),
  args: ["src/index.ts"],
};
const frontend = {
  name: "frontend",
  cwd: path.join(root, "ecommerce-customer"),
  script: path.join(root, "ecommerce-customer", "node_modules", "vite", "bin", "vite.js"),
  args: process.argv.slice(2),
};

let stopping = false;
const children = [];

function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
}

function startApp(app) {
  const child = spawn(process.execPath, [app.script, ...app.args], {
    cwd: app.cwd,
    stdio: "inherit",
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`Failed to start ${app.name}:`, error);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      if (signal) console.error(`${app.name} stopped after ${signal}`);
      stopAll(code ?? 1);
    }
  });
  return child;
}

function waitForBackend(child) {
  const timeoutAt = Date.now() + 60000;

  return new Promise((resolve, reject) => {
    const check = () => {
      if (child.exitCode !== null || child.signalCode !== null) {
        reject(new Error("Backend stopped before it became ready."));
        return;
      }

      const socket = net.createConnection({ host: "127.0.0.1", port: backendPort });
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() >= timeoutAt) {
          reject(new Error(`Backend did not start listening on port ${backendPort} within 60 seconds.`));
          return;
        }
        setTimeout(check, 250);
      });
    };

    check();
  });
}

function isBackendAlreadyRunning() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: backendPort });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

process.on("SIGINT", () => stopAll(130));
process.on("SIGTERM", () => stopAll(143));

async function start() {
  if (await isBackendAlreadyRunning()) {
    console.error(`Port ${backendPort} is already in use. Stop the existing backend and retry.`);
    process.exitCode = 1;
    return;
  }

  const backendProcess = startApp(backend);
  try {
    await waitForBackend(backendProcess);
  } catch (error) {
    console.error(error.message);
    stopAll(1);
    return;
  }

  if (!stopping) startApp(frontend);
}

start();
