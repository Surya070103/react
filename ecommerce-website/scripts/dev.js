const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const apps = [
  {
    name: "backend",
    cwd: path.join(root, "ecommerce-backend"),
    script: path.join(root, "ecommerce-backend", "node_modules", "ts-node", "dist", "bin.js"),
    args: ["src/index.ts"],
  },
  {
    name: "frontend",
    cwd: path.join(root, "ecommerce-customer"),
    script: path.join(root, "ecommerce-customer", "node_modules", "vite", "bin", "vite.js"),
    args: process.argv.slice(2),
  },
];

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

for (const app of apps) {
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
}

process.on("SIGINT", () => stopAll(130));
process.on("SIGTERM", () => stopAll(143));
