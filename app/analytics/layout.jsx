import SideNavigation from "@/components/side-navigation/sideNav";

function layout({ children }) {

  return (
    <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
      <SideNavigation />

      <div className="grid place-items-center min-h-screen min-w-[500px]">
        <div className="bg-white my-6 min-h-[75vh] w-3/4 rounded shadow p-5">
          {children}
        </div>
      </div>
    </main>
  );
}

export default layout;
