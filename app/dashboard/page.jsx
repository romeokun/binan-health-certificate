"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/components/auth-provider";
import SideNavigation from "@/components/side-navigation/sideNav";

function Dashboard() {
  const { currentUser } = useContext(AuthContext);

  return (
    <main className="grid grid-cols-[320px_1fr]">
      <SideNavigation />
      <div className="h-[1000px]">dashboard</div>
    </main>
  );
}

export default Dashboard;
