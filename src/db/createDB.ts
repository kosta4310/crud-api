import { createServer, Socket } from "node:net";
// import { Error404 } from "src/errors/myError";
import { User } from "src/utils/types";
import { v4 as uuidv4, validate } from "uuid";
import { httpStatusCodes as code } from "../utils/httpStatusCodes";

const users: Array<User> = [];

export async function createServerDB(port: Number) {
  return new Promise((resolve) => {
    const dbServer = createServer(handlerDatabaseSocket);

    dbServer.listen(port, () => {
      console.log(`Database is ready for work on PORT ${port}`);
      resolve(dbServer);
    });

    function handlerDatabaseSocket(socket: Socket) {
      socket.on("data", (data) => {
        const responseFromDatabase = getResponse(data);
        // users.push({ name: count++ + "" });
        // console.log(data.toString());
        socket.write(`${JSON.stringify(responseFromDatabase)}`);
      });
    }
  });
}

function getResponse(data: Buffer) {
  const req: { method: "find" | "findOne"; payload: any } = JSON.parse(
    data.toString()
  );
  const { method, payload } = req;

  const methods = {
    find,
    findOne,
    insert,
  };

  return methods[method](payload);

  function find(args: any) {
    return users;
  }

  function findOne(id: string) {
    if (validate(id)) {
      return users.find((user) => user.id === id);
    }
    throw new Error404("User doesn't exist");
  }

  function insert(user: Omit<User, "id">) {
    const newId = uuidv4();
    const savedUser = { ...user, id: newId };
    users.push(savedUser);
    return savedUser;
  }
}

export class MyError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class Error400 extends MyError {
  constructor(message: string) {
    super(message, code.BAD_REQUEST);
  }
}

export class Error404 extends MyError {
  constructor(message: string) {
    super(message, code.NOT_FOUND);
  }
}
