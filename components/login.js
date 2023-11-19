'use client';

import { auth } from '@/config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react'

import authenticate from '@/util/authenticate';

export const Login = () => {
 const router = useRouter()
 const [user, setUser] = useState(null)
 
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 
 authenticate(setUser, router, usePathname())

 const logIn = async () => {
  try {
   await signInWithEmailAndPassword(auth, email, password)
   router.push('/')
  } catch (error) {
   console.error(error)
  }
 }

 return (
    <section>
     <input type="text" className="border" placeholder="email" onChange={ (e) => setEmail(e.target.value)}/>
     <input type="password" className="border" placeholder="password" onChange={ (e) => setPassword(e.target.value)}/>
     <button onClick={ logIn } className="border">Sign in</button>
    </section>
 )
}