import SideNavigation from "@/components/side-navigation/sideNav";
import DashboardComponent from "@/components/dashboard/dashboard";

function layout({ children }) {

  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />

      <div className="grid place-items-center min-h-screen ">
        <div className="bg-white h-3/4 w-3/4 rounded shadow p-5">
          {children}
        </div>
      </div>
    </main>
  );
}

export default layout;
