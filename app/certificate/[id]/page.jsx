"use client";
import React, { useEffect, useState } from "react";
import { Certificate } from "@/components/dashboard/certificate";
import Link from "next/link";
import { db } from "@/config/firebase";
import { getDoc, doc } from "firebase/firestore";

function Page({ params }) {
  const defaultData = {
    id: params.id,
    or: "",
    no: "",
    dateIssued: { full: "" },
    employeeName: "",
    occupation: "",
    age: "",
    sex: "",
    nationality: "",
    category: "",
    placeOfWork: "",
    barangay: "",
    issuerName: "",
    dateIssuance: "2024-1-1",
    
  };
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    getDoc(doc(db, "records", params.id)).then((res) => {
      if (res.exists()) {
        setData({ ...data, ...res.data() });
      } else {
        setData({ error: "Certificate does not exist" });
      }
    });
  }, []);

  return (
    <main>
      <Link href={"/"}>
        <div className="p-4 bg-slate-800 text-white text-lg">
          Binan City Health Office
        </div>
      </Link>
      <div className="mt-4 text-center">Certificate - {params.id}</div>
      <div className="max-w-full overflow-x-auto grid place-content-center">
        {data.error ? (
          <div className="bg-red-400">{data.error}</div>
        ) : (
          <Certificate data={data} />
        )}
      </div>
    </main>
  );
}

export default Page;
