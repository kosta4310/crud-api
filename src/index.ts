import cluster from "cluster";
import os from "node:os";
import { isModeCluster } from "./utils/isModeCluster";
import { getWorkerServer } from "./server";
import { createServer, Server } from "http";
import net from "node:net";
import "dotenv/config";
import { createServerDB } from "./db/createDB";

const PORT = Number(process.env.PORT) || 4000;
const DB_PORT = Number(process.env.DB_PORT) || 8000;

const isCluster = isModeCluster();
export const db = new net.Socket();

async function startApp() {
  if (isCluster) {
    if (cluster.isPrimary) {
      // Primary process

      await createServerDB(DB_PORT);
      const numCPUs = os.cpus().length;

      const workersPorts: Array<number> = [];

      for (let i = 0; i < numCPUs; i++) {
        const currentWorkerPort = PORT + i + 1;
        workersPorts.push(currentWorkerPort);
        cluster.fork({
          workerPort: currentWorkerPort,
        });
      }

      let i = 0;
      function getNextWorkerPort() {
        return workersPorts[i++ % numCPUs];
      }

      function handlerPrimarySocket(socket: net.Socket) {
        socket.on("data", (data) => {
          const workersSocket = new net.Socket();
          const nextPort = getNextWorkerPort();

          workersSocket.connect(nextPort, "127.0.0.1", () => {
            workersSocket.write(data);
            workersSocket.emit("close");
          });

          workersSocket.on("data", (workersData) => {
            socket.write(workersData);
          });
        });
      }

      const masterServer = net.createServer(handlerPrimarySocket).listen(PORT);

      masterServer.on("listening", () =>
        console.log(`primary is listening on PORT ${PORT}`)
      );

      console.log(`Primary process ${process.pid}`);
    } else {
      // Worker's process

      const workerPort = process.env.workerPort;
      if (workerPort) {
        const server = await getWorkerServer(Number(workerPort));
        server.listen(workerPort, () =>
          console.log(`Worker server listen on PORT ${workerPort}`)
        );

        db.connect(DB_PORT, "127.0.0.1", () =>
          console.log(
            `Worker port ${workerPort} pid ${process.pid} is connected to database`
          )
        );
      }
    }
  } else {
    // Single worker process

    await createServerDB(DB_PORT);
    const server = await getWorkerServer(PORT);
    server.listen(PORT, () => console.log(`Server listen on PORT ${PORT}`));

    db.connect(DB_PORT, "127.0.0.1", () =>
      console.log(
        `Server port ${PORT} pid ${process.pid} is connected to database`
      )
    );
  }
}

startApp();
