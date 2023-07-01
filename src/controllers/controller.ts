import { User } from "src/utils/types";
import { db } from "../";

export function getAllUsers() {
  db.write(JSON.stringify({ method: "find" }));
}

export function getUserById(id: string) {
  db.write(JSON.stringify({ method: "findOne", payload: id }));
}

export function createUser(user: Omit<User, "id">) {
  db.write(JSON.stringify({ method: "insert", payload: user }));
}

export function updateUser(user: Omit<User, "id">, id: string) {
  db.write(JSON.stringify({ method: "update", payload: { ...user, id } }));
}

export function removeUser(id: string) {
  db.write(JSON.stringify({ method: "remove", payload: id }));
}
