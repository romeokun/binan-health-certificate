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
   const errorMessage = document.getElementById('message')
   const fields = document.querySelectorAll('input')
   errorMessage.classList.remove('hidden')

   fields.forEach( x => {
      x.classList.add('border-red-500')
   })
  }
 }

 return (
    <section className='border h-[600px] bg-white rounded-lg flex flex-col w-[600px] shadow-inner'>
     <div> Biñan City Health Office </div>
     <div className='text-[32px] mt-[64px] mx-auto font-bold'> Login </div>
     <div className='text-[16px] ml-[64px]'> Email </div>
     <div className='mx-auto w-[80%] mt-[8px]'><input type="text" className="border rounded-lg p-2 w-[100%]" placeholder="Email Address" onChange={ (e) => setEmail(e.target.value)} onBlur={(e) => {e.target.classList.remove('border-red-500')}}/></div>
     <div className='text-[16px] mt-[24px] ml-[64px]'> Password </div>
     <div className='mx-auto w-[80%] mt-[8px] '><input type="password" className="border rounded-lg p-2 w-[100%]" placeholder="Password" onChange={ (e) => setPassword(e.target.value)} onBlur={(e) => {e.target.classList.remove('border-red-500')}}/></div>
     <div className='mx-auto w-[80%] flex justify-center mt-[12px]'><button onClick={ logIn } className="border border-slate-800 rounded-lg px-[100px] py-[8px] bg-slate-800 text-white shadow-xl shadow-slate-800 transition ease-in-out hover:scale-110 hover:bg-slate-700 focus:scale-110">Sign in</button></div>
     <div id='message' className='mx-auto w-[80%] mt-[24px] py-[8px] px-[16px]  text-white bg-red-500 text-center hidden'> The Email or Password is incorrect </div>
    </section>
 )
}