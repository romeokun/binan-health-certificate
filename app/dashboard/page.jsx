"use client";
import React, { useContext } from "react";
import { AuthContext, AuthUser } from "@/components/auth-provider";
function Dashboard() {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      {currentUser ? <>loggedin</> : <>notloggedin</>}
      <div>Dashboard</div>
    </>
  );
}

export default Dashboard;
