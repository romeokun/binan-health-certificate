"use client";
import React from "react";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/components/auth-provider";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { RefreshCw } from "lucide-react";

export default function LoginPage() {
  const { currentUser, isLoading } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (currentUser && !isLoading) {
      router.push("/dashboard");
    } else {
    }
  }, [currentUser]);

  useEffect(() => {
    setMessage("");
  }, [loginData]);

  const logIn = async (e) => {
    e.target.disabled = true;
    setLoggingIn(true);
    signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      .then(() => {})
      .catch((error) => {
        setMessage("Invalid Login");
        setLoggingIn(false);
        e.target.disabled = false;
      });
  };

  return (
    <main className="min-h-screen bg-accent flex flex-row items-center justify-center content-center">
      <section className="border bg-white rounded-lg flex flex-col w-[600px] shadow-inner">
        <div className="text-center text-2xl font-bold mt-[32px]">
          Biñan City Health Office
        </div>
        <div className="text-[32px] mt-[32px] mx-auto font-semibold">
          {" "}
          Login{" "}
        </div>
        <div className="text-[16px] ml-[64px]"> Email </div>
        <div className="mx-auto w-[80%] mt-[8px]">
          <input
            type="text"
            className={"border rounded-lg p-2 w-[100%]"}
            placeholder="Email Address"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            onBlur={(e) => {
              e.target.classList.remove("border-red-500");
            }}
          />
        </div>
        <div className="text-[16px] mt-[24px] ml-[64px]"> Password </div>
        <div className="mx-auto w-[80%] mt-[8px] ">
          <input
            type="password"
            className="border rounded-lg p-2 w-[100%]"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            onBlur={(e) => {
              e.target.classList.remove("border-red-500");
            }}
          />
        </div>
        <div className="mx-auto w-[80%] flex justify-center mt-[12px]">
          <button
            onClick={logIn}
            className="border border-slate-800 rounded-lg px-[100px] py-[8px] bg-slate-800 text-white shadow-xl shadow-slate-800 transition ease-in-out hover:scale-110 hover:bg-slate-700 focus:scale-110 relative flex gap-4 place-content-center"
          >
            <span> Sign in </span>
            {loggingIn && <RefreshCw className="animate-spin" size={20} />}
          </button>
        </div>

        <div
          id="message"
          className={
            "mx-auto w-[80%] mt-[24px] py-[8px] px-[16px] mb-4  text-white text-center " +
            (message != "" && "bg-red-500")
          }
        >
          {message}
        </div>
      </section>
    </main>
  );
}
