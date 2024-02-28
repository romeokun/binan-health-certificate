"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import DashboardComponent from "@/components/dashboard/dashboard";

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="grid place-items-center min-h-screen ">
      <DashboardComponent>dash</DashboardComponent>
    </div>
  );
}

export default Dashboard;
