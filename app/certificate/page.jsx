import React from 'react'
import { SingleCertificate} from '@/components/certificateView/singleCertificate'
import { collection, getDocs } from 'firebase/firestore'

// to do: list all certificates
function page() {
  return (
    <div>
      certificates, print query
      <input type="text" name="" id="" className='border'/>
      <SingleCertificate />
      items per page 10, 20, 50, 100
      
    </div>
  )
}

export default page