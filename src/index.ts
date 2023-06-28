import cluster from "cluster";
import os from "node:os";
import { isModeCluster } from "./utils/isModeCluster";
import { getWorkerServer } from "./server";
import { createServer, Server } from "http";
import net from "node:net";
import "dotenv/config";

const PORT = Number(process.env.PORT) || 4000;
const isCluster = isModeCluster();

async function startApp() {
  if (isCluster) {
    if (cluster.isPrimary) {
      // Primary process

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
          workersSocket.connect(getNextWorkerPort(), "127.0.0.1", () => {
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

      console.log(process.pid);
      const workerPort = process.env.workerPort;
      if (workerPort) {
        const server = await getWorkerServer(Number(workerPort));
        server.listen(workerPort, () =>
          console.log(`Worker server listen on PORT ${workerPort}`)
        );
      }
    }
  } else {
    // Single worker process

    const server = await getWorkerServer(PORT);
    server.listen(PORT, () => console.log(`Server listen on PORT ${PORT}`));
  }
}

startApp();
