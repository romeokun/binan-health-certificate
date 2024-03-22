"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/components/auth-provider";

function Page() {
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push("/login");
    }
  }, []);

  return <div>Page</div>;
}

export default Page;
