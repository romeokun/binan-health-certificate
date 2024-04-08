"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavLogo from "@/public/bch-logo.png";
import Banner from "@/public/banner1.jpg";

export default function Home() {
  const router = useRouter();
  const cameraDivID = useId();
  const pathname = usePathname();
  const html5QrcodeScanner = useRef(null);
  const [show, setShow] = useState(true);

  function onScanSuccess(decodedText, decodedResult) {
    let result = decodedText.split("-");
    if (result[0] === "binancert") {
      html5QrcodeScanner.current.clear();
      router.push("/certificate/" + result[1]);
    } else {
      console.log("qr is not binancert");
    }
  }

  useEffect(() => {
    try {
      if (pathname == "/") {
        html5QrcodeScanner.current = new Html5QrcodeScanner(
          cameraDivID,
          { fps: 10, qrbox: 250 },
          /* verbose= */ false
        );
      }
    } catch (error) {}

    return () => {
      try {
        html5QrcodeScanner.current.clear();
      } catch (error) {}
    };
  }, [pathname]);

  return (
    <main>
      <div className="p-4 grid grid-cols-[min-content_1fr] border-b gap-2">
        <div className="relative w-[200px]">
          <Image src={NavLogo} alt="binan logo" />
        </div>
        <div className="grid content-center">
          <span>Office Of The City Health Officer</span>
        </div>
      </div>
      <div className="relative">
        <Image src={Banner} alt="binan logo" />
      </div>
      <section className=" p-6">
        Welcome to Biñan City Health Office Website.
      </section>
      <section className="bg-accent p-6">
        <div>Scan a Biñan Health Certificate</div>

        {show && (
          <Button
            onClick={() => {
              setShow(false);
              setTimeout(() => {
                const container = document.getElementById(cameraDivID);
                if (html5QrcodeScanner.current && container?.innerHTML == "") {
                  html5QrcodeScanner.current.render(onScanSuccess);
                }
              }, 0);
            }}
          >
            Open Scanner
          </Button>
        )}
        <div className="max-w-[720px]" id={cameraDivID}></div>
      </section>
    </main>
  );
}
