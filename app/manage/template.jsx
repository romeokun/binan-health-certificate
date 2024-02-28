import React from 'react'
import SideNavigation from '@/components/side-navigation/sideNav'
function template({children}) {
  return (
   <main className={"grid grid-cols-[min-content_1fr] bg-slate-100"}>
   <SideNavigation />

   <div className="grid place-items-center min-h-screen ">
     {children}
   </div>
 </main>
  )
}

export default template