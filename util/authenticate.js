import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/config/firebase'
import { usePathname, useRouter } from "next/navigation";

const authenticate = (setUser, router, currentPath) => {
 const unsubscribe = onAuthStateChanged(auth, (user) => {
  setUser(user)
  console.log(currentPath);
  if(user) {
   if(currentPath == '/login') {
    router.push('/')
   }
  } else {
   console.log('not logged in');
   if(currentPath !== '/login') {
    router.push('/login')
   }
  }
  
  unsubscribe()
})
 
}

export default authenticate
