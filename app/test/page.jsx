"use client";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";

import { CertificateForm } from "@/components/certificateForm";
import FormButton from "@/components/main page components/formButton";
import Modal from "@/components/main page components/modal";

import { SingleCertificate } from "@/components/main page components/singleCertificate";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { CertificateFormView } from "@/components/certificateFormView";

async function loadQuery(func) {
 console.log('querying');
  func("");
  const q = query(collection(db, "certificates"), orderBy("created", "desc"));
  const querySnapshot = await getDocs(q);
  func(querySnapshot);
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [querySnapshot, setQuerySnapshot] = useState("");
  const [certificate, setCertificate] = useState("");

  const [modalView, setModalView] = useState('new')

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setInitialized(true);
    });
    loadQuery(setQuerySnapshot);
  }, []);

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

  function showCreateForm() {
    const modal = document.getElementById("modal");
    setModalView('new');
    modal.classList.remove("hidden");
  }

  function reload() {
   loadQuery(setQuerySnapshot);
  }

  function view() {
    const modal = document.getElementById("modal");
    setModalView('view');
    modal.classList.remove("hidden");
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
        <FormButton func={reload} text={"reload"} />
        <FormButton func={showCreateForm} text={"new"} />
        <FormButton text={"search"} />
        <FormButton text={"report"} />
        <FormButton text={"analytics"} />
      </div>
      <section className=" mx-[24px] flex flex-row min-h-[600px] box-content min-w-[800px]">
        <div
          id="mainContent"
          className="rounded-br-lg bg-emerald-200 min-w-[800px] shadow-xl flex flex-col p-[8px] flex-auto transition-[width] ease-in-out gap-[12px] "
        >
          {querySnapshot?.docs?.map((Certificate, index) => {
            return (
              <SingleCertificate
                className="w-full overflow-hidden"
                key={Certificate.id}
                certificate={Certificate}
                set={setCertificate}
                viewForm={view}
                reload={reload}
              />
            );
          })}
        </div>
      </section>

      <Modal reload={reload}>
        {modalView === 'new' && <CertificateForm/>}
        {modalView === 'view' && <CertificateFormView certificate={certificate}/>}
      </Modal>
    </main>
  );
}

