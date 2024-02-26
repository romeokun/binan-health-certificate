import React, { useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

function sideNavigation() {
  const pathname = usePathname();
  const navigations = [
    { link: "/dashboard", text: "Dashboard" },
    { link: "/manage", text: "Manage" },
  ];

  // useEffect(() => {}, []);

  return (
    <div className="sticky top-0 grid grid-cols-1 h-screen bg-slate-700">
      <div>
        <span className="block text-center text-white">Binan Health Certificate</span>
      </div>
      <ul>
        {navigations.map((nav) => {
          const samePage = pathname == nav.link;
          return (
            <li>
              <NavigationButton isPressed={samePage} link={nav.link}>
                {" "}
                {nav.text}{" "}
              </NavigationButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NavigationButton({ link, children, isPressed }) {
  return (
    <Toggle className="block w-9/12 mx-auto my-1" pressed={isPressed}>
      <Link href={link}>{children}</Link>
    </Toggle>
  );
}

export default sideNavigation;
