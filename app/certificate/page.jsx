import React from "react";
import { SingleCertificate} from '@/components/certificateView/singleCertificate'
import { collection, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";

// to do: list all certificates, add filters
async function page() {
  const q = query(collection(db, "certificates"), orderBy('created','desc'))
  const querySnapshot = await getDocs(q);

  return (
    <div>
      certificates, print query
      <input type="text" name="" id="" className="border" />
      {querySnapshot.docs?.map((Certificate, index) => {
        return <SingleCertificate key={index} certificate={Certificate.data()} />;
      })}
      items per page 10, 25, 50, 100
    </div>
  );
}



export default page;
