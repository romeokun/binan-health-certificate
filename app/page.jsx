'use client'
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";

export default function Home() {
  
  const [ loggedIn, setLoggedIn ] = useState(false)
  const [ initialized, setInitialized ] = useState(false)
  useEffect(onAuthStateChanged(auth, user => {
    if (user) {
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
    }
    setInitialized(true)
  }), [])
  
  if(!initialized) {
    return <Loading />
  } else if(!loggedIn) {
    redirect('/login')
  }
  
  const signout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error(error);
    }
   }

  return <main>{
    <>binan health office home
    <button className='border m-2' onClick={ signout }>signout</button>
    <p>add certificate</p>
    <p>view certificate</p>
    <p>logs</p>
    </>
    }</main>;
}