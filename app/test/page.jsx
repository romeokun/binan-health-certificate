"use client";

import { auth } from "@/config/firebase";
import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

async function getMessage() {
  const response = await fetch("/api/signin", { method: "GET" });
  console.log(await response.json());
}
async function postMessage(id) {
  const response = await fetch("/api/signin", {
    method: "POST",
    body: JSON.stringify({ text: "from post", uid: id }),
  });
  console.log(await response.json());
}

export default function Home() {
  const [uid, setUID] = useState('')
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUID(user.uid)
    } 
  });

  return (
    <main>
      test
      <button type="button" onClick={getMessage}>
        click
      </button>{" "}
      <br />
      <button type="button" onClick={()=>{postMessage(uid)}}>
        post
      </button>
    </main>
  );
}
