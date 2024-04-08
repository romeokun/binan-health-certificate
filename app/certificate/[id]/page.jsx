"use client";
import React, { useEffect, useState } from "react";
import { Certificate } from "@/components/dashboard/certificate";
import Link from "next/link";
import { db } from "@/config/firebase";
import { getDoc, doc } from "firebase/firestore";
import Image from "next/image";
import NavLogo from "@/public/bch-logo.png";

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
      <div className="p-4 grid grid-cols-[min-content_1fr] border-b gap-2">
        <div className="relative w-[200px]">
          <Link href={"/"}>
            <Image src={NavLogo} alt="binan logo" />
          </Link>
        </div>
        <div className="grid content-center">
          <span>Office Of The City Health Officer</span>
        </div>
      </div>
      <div className="mt-4 text-center">Certificate - {data.employeeName}</div>
      <div className="max-w-full overflow-x-auto">
        {data.error ? (
          <div className="bg-red-400">{data.error}</div>
        ) : (
          <div className="w-min m-auto">
            <Certificate data={data} />
          </div>
        )}
      </div>
    </main>
  );
}

export default Page;
