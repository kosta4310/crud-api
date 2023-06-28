import { createServer, Server, IncomingMessage, ServerResponse } from "http";

export function getWorkerServer(
  port: number
): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      res.end(`Hello from PORT ${port}`);
    });
    resolve(server);
  });
}
