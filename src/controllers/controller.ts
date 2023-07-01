import { User } from "src/utils/types";
import { db } from "../";

export function getAllUsers() {
  db.write(JSON.stringify({ method: "find" }));
}

export function createUser(user: Omit<User, "id">) {
  db.write(JSON.stringify({ method: "insert", payload: user }));
}
