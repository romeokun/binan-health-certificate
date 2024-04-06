import React from "react";

function FormButton( {func, text} ) {
  return (
    <div onClick={func} className="flex content-center flex-wrap">
      <p className="w-[15ch] text-center cursor-pointer border rounded-full px-[8px] bg-white hover:scale-105">
        {text}
      </p>
    </div>
  );
}

export default FormButton;
