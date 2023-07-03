import { User } from "./types";

export function isValidInputUserData(user: Omit<User, "id">): Boolean {
  const { username, age, hobbies } = user;
  if (!username || typeof username !== "string") {
    return false;
  }

  if (!age || typeof age !== "number" || age < 0) {
    return false;
  }

  if (!hobbies || !Array.isArray(hobbies)) {
    return false;
  }

  if (hobbies && hobbies.length && !isArrayOfString(hobbies)) {
    return false;
  }
  return true;
}

function isArrayOfString(arr: any) {
  let res = true;
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (typeof element !== "string") {
      res = false;
      return;
    }
  }
  return res;
}
