// import React from "react";
import SideNavigation from "@/components/side-navigation/sideNav";

function template({ children }) {
  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />
      {children}
    </main>
  );
}

export default template;
