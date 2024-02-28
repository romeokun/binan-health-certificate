import SideNavigation from "@/components/side-navigation/sideNav";
import DashboardComponent from "@/components/dashboard/dashboard";

function template({ children }) {
  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />

      <div className="grid place-items-center min-h-screen ">
        <DashboardComponent>{children}</DashboardComponent>
      </div>
    </main>
  );
}

export default template;
