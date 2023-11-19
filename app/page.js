import { auth } from '@/config/firebase'
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

import authenticate from '@/util/authenticate'

export default function Home() {

  const router = useRouter()
 
  authenticate(setUser, router, usePathname)
  if(!user) {
    return(<>loading...</>)
  }

  

  return (
    
    <main>
      { <>
          binan health office home
        </>}  
    </main>
  )
}
