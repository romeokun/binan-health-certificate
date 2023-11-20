'use client'
import React from 'react'
import { Login } from '@/components/login'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { redirect } from 'next/navigation'

export default function LoginPage() {
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
    return <>loading</>
  } else if(loggedIn) {
    redirect('/')
  }

  return (
   <main className='min-h-screen flex flex-row items-center justify-center content-center'>
    <Login />
   </main>
  )
}
