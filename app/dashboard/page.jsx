"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import SideNavigation from "@/components/side-navigation/sideNav";

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);
 

  return (
    <main className={"grid grid-cols-[320px_1fr]"}>
      <SideNavigation />
      <div className="h-[1000px]">dashboard</div>
    </main>
  );
}

export default Dashboard;
