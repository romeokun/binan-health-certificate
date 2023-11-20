import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

export const authenticate = () => {
  let result
  onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user) {
      result = true
    } else {
      result = false
    }

  })
  return result
};

