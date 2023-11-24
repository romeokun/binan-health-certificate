'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { redirect } from 'next/navigation'
import { Loading } from '@/components/loading'

export default function CertificateLayout({ children }) {

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

  return (
    <>{children}</>
  )
}
