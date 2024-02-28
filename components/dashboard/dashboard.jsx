'use client'
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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

function DashboardComponent({ children }) {
  return (
    <div className="min-w-[300px] w-8/12 min-h-[300px] p-10 border rounded shadow bg-white">
      <h1 className="pl-4 pb-2 text-2xl font-semibold">Dashboard</h1>
      <NavigationMenu>
        <NavigationMenuList className="border p-2 rounded-sm shadow">
          <DashLink href="/dashboard"> Record </DashLink>
          <DashLink href="/dashboard/employee"> Employee </DashLink>
        </NavigationMenuList>
      </NavigationMenu>
      {children}
    </div>
  );
}

export default DashboardComponent;
