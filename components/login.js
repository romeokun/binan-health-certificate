'use client';

import { auth } from '@/config/firebase'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { redirect } from 'next/navigation';
import { useState } from 'react'

export const Login = () => {
 
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')

 const logIn = async () => {
  try {
   await signInWithEmailAndPassword(auth, email, password)
   redirect('/')
  } catch (error) {
   console.error(error)
  }
 }

 return (
    <section className='border h-[600px]'>
     <input type="text" className="border" placeholder="email" onChange={ (e) => setEmail(e.target.value)}/>
     <input type="password" className="border" placeholder="password" onChange={ (e) => setPassword(e.target.value)}/>
     <button onClick={ logIn } className="border">Sign in</button>

    </section>
 )
}