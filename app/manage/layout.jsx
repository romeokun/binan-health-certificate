"use client";
import SideNavigation from "@/components/side-navigation/sideNav";
import { useContext, useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/components/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Loading } from "@/components/loading";

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

function Layout({ children }) {
  const { currentUser, isLoading } = useContext(AuthContext);
  const [state, setState] = useState("loading");

  useEffect(() => {

    getDoc(doc(db, "users", currentUser.uid)).then((user) => {
      if (user) {
        if (user.data().role == "admin") {
          setState("authorized");
        } else {
          setState("unauthorized");
        }
      }
    }).catch(error => {
      setState("unauthorized")
    });
  }, []);

  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />

      <div className="grid place-items-center min-h-screen min-w-[500px]">
        <div className="bg-white my-6 min-h-[75vh] w-3/4 rounded shadow p-9">
          <h1 className="pl-4 pb-2 text-2xl font-semibold">Manage</h1>
          {state == "loading" && <div className="h-[50vh]"><Loading /></div>}
          {state == "unauthorized" && <>Unauthorized</>}
          {state == "authorized" && (
            <>
              <NavigationMenu>
                <NavigationMenuList className="border p-2 rounded-sm shadow">
                  <DashLink href="/manage"> Logs </DashLink>
                  <DashLink href="/manage/users"> Users </DashLink>
                </NavigationMenuList>
              </NavigationMenu>
              {children}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Layout;
