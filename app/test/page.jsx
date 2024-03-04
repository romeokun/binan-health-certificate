"use client";

import { auth } from "@/config/firebase";
import { useContext } from "react";
import { AuthContext } from "@/components/auth-provider";

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

async function deleteEmployee() {
  auth
    .currentUser.getIdToken(true)
    .then(function (idToken) {
      return fetch("/api/delete-employee", {
        method: "POST",
        body: JSON.stringify({ token:idToken, employeeID: "B6z2kwrvsm8ZyMGtVvri" }),
      });
      
    }).then(
      (response) => {
        console.log(response.json());

      }
    )
    .catch(function (error) {
      // Handle error
      console.error(error);
    });

}

export default function Home() {
  const { currentUser, isLoading } = useContext(AuthContext);
  if (!currentUser && !isLoading) {
    router.push("/login");
  }

  return (
    <main>
      test
      <button type="button" onClick={getMessage}>
        click
      </button>{" "}
      <br />
      <button
        type="button"
        onClick={() => {
          postMessage(uid);
        }}
      >
        post
      </button>
      <div>
        <button className="mt-2" onClick={deleteEmployee}>
          delete
        </button>
      </div>
    </main>
  );
}
