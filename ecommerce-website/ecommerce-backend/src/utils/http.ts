import http from "node:http";

export const setCorsHeaders = (res: http.ServerResponse): void => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export const parseJsonBody = async <T = unknown>(req: http.IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body.trim()) {
        return resolve({} as T);
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", (error) => reject(error));
  });
};

export const sendJson = (res: http.ServerResponse, statusCode: number, data: unknown): void => {
  setCorsHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

export const sendEmpty = (res: http.ServerResponse, statusCode: number): void => {
  setCorsHeaders(res);
  res.writeHead(statusCode);
  res.end();
};

