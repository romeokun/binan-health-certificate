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
    <section className='border h-[600px] bg-white rounded-lg flex flex-col w-[600px] '>
     <div> Biñan City Health Office </div>
     <div className='text-[32px] mt-[64px] mx-auto font-bold'> Login </div>
     <div className='mx-auto w-[80%] mt-[32px]'><input type="text" className="border rounded-lg p-2 w-[100%]" placeholder="Email Address" onChange={ (e) => setEmail(e.target.value)}/></div>
     <div className='mx-auto w-[80%] mt-[12px]'><input type="password" className="border rounded-lg p-2 w-[100%]" placeholder="Password" onChange={ (e) => setPassword(e.target.value)}/></div>
     <div className='mx-auto w-[80%] flex justify-center mt-[12px]'><button onClick={ logIn } className="border border-slate-800 rounded-lg px-[100px] py-[8px] bg-slate-800 text-white shadow-xl shadow-slate-800 transition ease-in-out hover:scale-110 hover:bg-slate-700">Sign in</button></div>
     <div className='hidden mx-auto w-[80%] mt-[24px] py-[8px] px-[16px]  text-white bg-red-500 text-center'> The Email or Password is incorrect </div>
    </section>
 )
}