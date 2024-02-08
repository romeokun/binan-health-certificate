"use client";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";
import { CertificateForm } from "@/components/certificateForm";

import { SingleCertificate } from "@/components/main page components/singleCertificate";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { CertificateFormView } from "@/components/certificateFormView";



async function loadQuery(func) {
  func('')
  const q = query(collection(db, "certificates"), orderBy('created','desc'))
  const querySnapshot = await getDocs(q);
  func(querySnapshot);
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [querySnapshot,setQuerySnapshot] = useState('')
  const [certificate,setCertificate] = useState('')
  const [ isView, setIsView] = useState(false)

  useEffect( () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setInitialized(true);
    })
    loadQuery(setQuerySnapshot)
  }
    ,[]    
  );

  if (!initialized) {
    return <Loading />;
  } else if (!loggedIn) {
    redirect("/login");
  }

  const signout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  function toggleFilterTab() {
    const element = document.getElementById("filterTab");
    const content = document.getElementById("mainContent");

    if (element.classList.contains("w-[300px]")) {
      element.classList.add("w-[0px]");
      element.classList.remove("w-[300px]");
      element.classList.remove("border-r-[4px]");
      element.classList.remove("border-gray-300");
      content.classList.add("rounded-bl-lg");
      element.classList.add("opacity-0");

      content.classList.add("min-w-[800px]");
      content.classList.remove("min-w-[500px]");
    } else {
      element.classList.remove("w-[0px]");
      element.classList.add("w-[300px]");
      element.classList.add("border-r-[4px]");
      element.classList.add("border-gray-300");
      content.classList.remove("rounded-bl-lg");
      element.classList.remove("opacity-0");

      content.classList.add("min-w-[500px]");
      content.classList.remove("min-w-[800px]");
    }
  }

  function showCreateForm() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
  }

  function reload() {
    loadQuery(setQuerySnapshot)
  }
  
  

  function view() {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");

    setIsView(true)
  }


  return (
    <main>
      <nav className="bg-emerald-400 mb-[12px] min-w-[800px]">
        binan health office - Username
        <button className="border m-2" onClick={signout}>
          signout
        </button>
      </nav>

      <div className="rounded-t-lg bg-emerald-200 min-w-[800px] mx-[24px] mt-[4px] h-[48px] border-b-[1px] border-black flex justify-center content-center gap-2">
        <div
          onClick={toggleFilterTab}
          className="flex content-center flex-wrap"
        >
          <p className="w-[15ch] text-center cursor-pointer border rounded-full px-[8px] bg-white hover:scale-105">
            filter
          </p>
        </div>

        <div
          onClick={reload}
          className="flex content-center flex-wrap"
        >
          <p className="w-[15ch] text-center cursor-pointer border rounded-full px-[8px] bg-white hover:scale-105">
            reload
          </p>
        </div>
        
        <div className="flex content-center flex-wrap">
          <p className="w-[15ch] text-center cursor-pointer border rounded-full px-[8px] bg-white hover:scale-105">
            select all
          </p>
        </div>
        <div onClick={showCreateForm} className="flex content-center flex-wrap">
          <p className="w-[15ch] text-center cursor-pointer border rounded-full px-[8px] bg-white hover:scale-105">
            new
          </p>
        </div>
      </div>
      <section className=" mx-[24px] flex flex-row min-h-[600px] box-content min-w-[800px]">
        <div
          id="filterTab"
          className="rounded-bl-lg border-gray-300 bg-emerald-200 w-[0px] shadow-xl transition-all ease-in-out"
        >
          side - filter
        </div>
        <div
          id="mainContent"
          className="rounded-br-lg bg-emerald-200 min-w-[800px] shadow-xl flex flex-col p-[8px] flex-auto transition-[width] ease-in-out gap-[12px] "
        >
          {querySnapshot?.docs?.map((Certificate, index) => {
            
            return (
              <SingleCertificate className='w-full overflow-hidden' key={index} certificate={Certificate} set={setCertificate} viewForm={view} reload={reload} />
            );
          })}
        </div>
      </section>

      <div
        id="modal"
        className="fixed w-screen h-screen top-0 flex flex-wrap place-content-center hidden"
      >
        <div
          onClick={() => {
            const modal = document.getElementById("modal");
            modal.classList.add("hidden");
            setIsView(false)
            reload()
          }}
          className="fixed bg-slate-300/80 w-full h-full -z-10"
        ></div>
        <div
          id="modalcontent"
          className="bg-white rounded w-[700px] h-[600px] shadow-lg"
        >
          { !isView ? <CertificateForm /> : <CertificateFormView certificate={certificate}/> }
          
        </div>
      </div>
    </main>
  );
}
