"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";
import SideNavigation from "@/components/side-navigation/sideNav";

// todo: for admin, manage users such as add and change role
// 3 role: admin, normal, disabled
// admin must not able to change another admin
function Manage() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <main className={"grid grid-cols-[320px_1fr]"}>
      <SideNavigation />
      <div className="h-[1000px]">Manage</div>
    </main>
  );
}

export default Manage;
