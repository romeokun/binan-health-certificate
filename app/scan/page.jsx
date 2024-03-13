"use client";
import { useEffect, useId, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const cameraDivID = useId();

  const initialized = useRef(false);
  function onScanSuccess(decodedText, decodedResult) {
    let result = decodedText.split("-");
    if (result[0] === "binancert") {
      router.push("/dashboard?id=" + result[1]);
    } else {
      console.log("qr is not binancert");
    }
  }
  useEffect(() => {
    if (!initialized.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        cameraDivID,
        { fps: 10, qrbox: 250 },
        /* verbose= */ false
      );
      html5QrcodeScanner.render(onScanSuccess);
      initialized.current = true;
    }
  }, []);

  return (
    <div className="shadow-md w-full h-full md:w-4/5 md:h-4/5 rounded bg-white">
      <div className="overflow-auto h-full">
          <div className="" id={cameraDivID}></div>
      </div>
    </div>
  );
}

export default Page;
