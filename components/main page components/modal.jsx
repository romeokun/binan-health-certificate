import React from 'react'

function Modal( {children, reload, setModalView} ) {
  return (
   <div
   id="modal"
   className="fixed w-screen h-screen top-0 flex flex-wrap place-content-center hidden"
 >
   <div
     onClick={() => {
       const modal = document.getElementById("modal");
       modal.classList.add("hidden");
       setModalView('none')
       reload();
     }}
     className="fixed bg-slate-300/80 w-[100vw] h-full -z-10"
   ></div>
   <div
     id="modalcontent"
     className="bg-white rounded w-[700px] h-[600px] shadow-lg"
   >
     {children}
   </div>
 </div>
  )
}

export default Modal;