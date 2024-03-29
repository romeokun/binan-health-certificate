"use client";
import React, { useState, useContext } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuthContext } from "../auth-provider";
import { Button } from "@/components/ui/button";

function sideNavigation() {
  const { currentUser, signout } = useContext(AuthContext);

  const [showNav, setShowNav] = useState(true);
  const handleToggleNav = () => {
    setShowNav(!showNav);
  };

  const pathname = usePathname();
  const navigations = [
    { link: "/dashboard", text: "Dashboard" },
    { link: "/scan", text: "Scan QR" },
    { link: "/analytics", text: "Analytics" },
    { link: "/manage", text: "Manage" },
    // { link: "/settings", text: "Settings" },  *probably unnecessary*
  ];

  const defaultStyle =
    "top-0 h-screen bg-slate-700 overflow-y-auto overflow-x-hidden transition w-[320px]";
  return (
    <div>
      <div
        className={
          defaultStyle + (showNav ? " sticky " : " fixed translate-x-[-100%] ")
        }
      >
        <div className="h-full grid grid-rows-[min-content_1fr_min-content] ">
          <div>
            <div>
              <span className="block text-center text-white text-lg font-bold my-2">
                Binan Health Certificate
              </span>
            </div>
            <div>
              <span className="block text-center text-white font-semibold">
                {currentUser?.displayName}
              </span>
            </div>
            <div>
              <span className="block text-center text-accent text-sm">
                {currentUser?.email}
              </span>
            </div>
          </div>

          <ul className="bg-slate-600 my-2 py-2">
            {navigations.map((nav) => {
              const samePage = pathname.includes(nav.link);
              return (
                <li key={nav.link}>
                  <NavigationButton isPressed={samePage} link={nav.link}>
                    {nav.text}
                  </NavigationButton>
                </li>
              );
            })}
          </ul>

          <div className="grid place-content-center my-4">
            <Button className="w-min" onClick={signout}>Logout</Button>
          </div>
        </div>
      </div>

      <button
        className={
          "h-[50px] w-[50px] rounded-full fixed flex justify-center content-center flex-wrap bottom-2 shadow-black shadow-lg z-50 " +
          (showNav ? "bg-white left-[250px]" : "bg-slate-400 left-2")
        }
        onClick={handleToggleNav}
      >
        {showNav && <ChevronLeft />}
        {!showNav && <ChevronRight />}
      </button>
    </div>
  );
}

function NavigationButton({ link, children, isPressed }) {
  return (
    <Link href={link}>
      <Toggle
        className="block w-9/12 mx-auto my-1 text-left"
        pressed={isPressed}
      >
        {children}
      </Toggle>
    </Link>
  );
}

export default sideNavigation;
