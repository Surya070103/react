import "dotenv/config";

const toPort = (value: string | undefined, fallback: number): number => {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number");
  }
  return port;
};

export const env = {
  port: toPort(process.env.PORT, 3000),
  database: {
    host: process.env.DB_HOST ?? "localhost",
    port: toPort(process.env.DB_PORT, 3306),
    username: process.env.DB_USERNAME ?? "root",
    password: process.env.DB_PASSWORD ?? "password",
    name: process.env.DB_DATABASE ?? "ecommerce",
  },
};
