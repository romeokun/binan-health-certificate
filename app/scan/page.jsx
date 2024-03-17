"use client";
import { useEffect, useId, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter, usePathname } from "next/navigation";

function Page() {
  const router = useRouter();
  const cameraDivID = useId();
  const pathname = usePathname();
  const html5QrcodeScanner = useRef(null);

  function onScanSuccess(decodedText, decodedResult) {
    let result = decodedText.split("-");
    if (result[0] === "binancert") {
      html5QrcodeScanner.current.clear();
      router.push("/dashboard?id=" + result[1]);
    } else {
      console.log("qr is not binancert");
    }
  }

  useEffect(() => {
    try {
      if (pathname == "/scan") {
        html5QrcodeScanner.current = new Html5QrcodeScanner(
          cameraDivID,
          { fps: 10, qrbox: 250 },
          /* verbose= */ false
        );
        setTimeout(() => {
          const container = document.getElementById(cameraDivID);
          if (html5QrcodeScanner.current && container?.innerHTML == "") {
            html5QrcodeScanner.current.render(onScanSuccess);
          }
        }, 0);
      }
    } catch (error) {}

    return () => {
      try {
        html5QrcodeScanner.current.clear();
      } catch (error) {}
    };
  }, [pathname]);

  return (
    <div className="shadow-md w-full h-full md:w-4/5 md:h-4/5 rounded bg-white">
      <div className="overflow-auto h-full">
        <div className="" id={cameraDivID}></div>
      </div>
    </div>
  );
}

export default Page;
