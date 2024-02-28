"use client";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";

function Employee() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return (
    <>Employee</>
  );
}

export default Employee;
