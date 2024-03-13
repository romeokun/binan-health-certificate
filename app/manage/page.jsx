"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";

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
    <>manage
    <br /> [edit users] [Logs] 
    </>
  );
}

export default Manage;
