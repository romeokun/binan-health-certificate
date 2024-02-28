"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import DashboardComponent from "@/components/dashboard/dashboard";

function Employee() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="grid place-items-center min-h-screen ">
      <DashboardComponent>employee</DashboardComponent>
    </div>
  );
}

export default Employee;
