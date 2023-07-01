import { createServer, Socket } from "node:net";
// import { Error404 } from "src/errors/myError";
import { ResponseServer, User } from "src/utils/types";
import { v4 as uuidv4, validate } from "uuid";
import { httpStatusCodes as code } from "../utils/httpStatusCodes";
import { isValidInputUserData } from "../utils/isValidInputUserData";

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
        try {
          const responseFromDatabase = getResponse(data);
          socket.write(JSON.stringify(responseFromDatabase));
        } catch (error) {
          socket.write(
            JSON.stringify({
              statusCode: 500,
              message: "Internal server error",
            })
          );
        }
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

  function find(args: any): ResponseServer {
    return { statusCode: 200, message: users };
  }

  function findOne(id: string): ResponseServer {
    if (validate(id)) {
      const user = users.find((user) => user.id === id);
      if (user) {
        return { statusCode: 200, message: user };
      }
      return { statusCode: 404, message: "The user doesnt exist" };
    }
    return { statusCode: 400, message: "Userid is not uuid" };
  }

  function insert(user: Omit<User, "id">): ResponseServer {
    if (!isValidInputUserData(user)) {
      return {
        statusCode: 400,
        message: "Request body does not contain required fields",
      };
    }
    const newId = uuidv4();
    const savedUser: User = Object.assign(user, { id: newId });
    users.push(savedUser);
    return { statusCode: 201, message: savedUser };
  }

  return methods[method](payload);
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
