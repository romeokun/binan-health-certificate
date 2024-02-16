import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default () => {
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
    setInitialized(true);
  }); 
} 


