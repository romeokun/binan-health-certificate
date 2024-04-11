"use client";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState, createContext } from "react";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export function AuthUser({ children }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
  }, []);

  if(isLoading) {
    return <div className="h-screen">
      <Loading/>
    </div> 
    
  }

  const signout = async () => {
    try {
      await signOut(auth);
      router.push('/login')
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signout }}>
      {children}
    </AuthContext.Provider>
  );
}
