"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      Month Year Company Renew refresh
      <div>table</div>
    </>
  );
}

export default Dashboard;
