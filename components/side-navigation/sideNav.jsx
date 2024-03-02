'use client'
import React, { useState,  } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";

function sideNavigation() {


  const [showNav, setShowNav] = useState(true);
  const handleToggleNav = () => {
    setShowNav(!showNav);
  };

  const pathname = usePathname();
  const navigations = [
    { link: "/dashboard", text: "Dashboard" },
    { link: "/analytics", text: "Analytics" },
    { link: "/manage", text: "Manage" },
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
        <div className="grid grid-cols-1 ">
          <div>
            <span className="block text-center text-white">
              Binan Health Certificate
            </span>
          </div>
          <ul className="bg-slate-600">
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
        </div>
      </div>
      <button
        className={
          "h-[50px] w-[50px] rounded-full absolute flex justify-center content-center flex-wrap bottom-2 shadow-black shadow-lg z-50 " +
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
      <Toggle className="block w-9/12 mx-auto my-1 text-left" pressed={isPressed}>
        {children}
      </Toggle>
    </Link>
  );
}

export default sideNavigation;
