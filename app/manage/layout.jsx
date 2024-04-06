"use client";
import SideNavigation from "@/components/side-navigation/sideNav";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import Link from "next/link";


const DashLink = ({ href, children }) => {
  const pathname = usePathname();
  const active = pathname == href;

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          active={active}
          className={navigationMenuTriggerStyle()}
        >
          {children}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};

function layout({ children }) {
  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />

      <div className="grid place-items-center min-h-screen min-w-[500px]">
        <div className="bg-white my-6 min-h-[75vh] w-3/4 rounded shadow p-9">
          <h1 className="pl-4 pb-2 text-2xl font-semibold">Manage</h1>
          <NavigationMenu>
            <NavigationMenuList className="border p-2 rounded-sm shadow">
              <DashLink href="/manage"> Logs </DashLink>
              <DashLink href="/manage/users"> Users </DashLink>
            </NavigationMenuList>
          </NavigationMenu>
          {children}
        </div>
      </div>
    </main>
  );
}

export default layout;
