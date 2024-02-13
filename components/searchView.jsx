import React, { useEffect, useId } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

async function loadQuery(docID, setCertificate, changeModalView) {
  try {
    const docRef = doc(db, "certificates", docID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap);
      setCertificate(docSnap);
      changeModalView("view");
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error(error);
  }
}

function SearchView({ modalView, changeModalView, setCertificate }) {
  function initializeScannerClosure(componentId, html5QrcodeScanner) {
    let hasBeenCalled = false;
    let rendered = false;
    return () => {
      console.log("hasbeencalled: ", hasBeenCalled);

      try {
        if (!hasBeenCalled) {
          html5QrcodeScanner = new Html5QrcodeScanner(
            componentId,
            { fps: 10, qrbox: 250 },
            /* verbose= */ false
          );
          hasBeenCalled = true;
        }

        if (!rendered) {
          setTimeout(() => {
            const container = document.getElementById(componentId);
            if (html5QrcodeScanner && container?.innerHTML == "") {
              html5QrcodeScanner.render(onScanSuccess);
            }
          }, 0);
          rendered = true;
        } else {
          html5QrcodeScanner.clear();
          rendered = false;
        }
      } catch (error) {
        console.error(error);
      }
    };
  }

  function onScanSuccess(decodedText, decodedResult) {
    let result = decodedText.split("-");
    if (result[0] === "binancert") {
      loadQuery(result[1], setCertificate, changeModalView);
    } else {
      console.log("qr is not binancert");
    }
  }

  const id = useId();
  let html5QrcodeScanner;
  const initializeScanner = initializeScannerClosure(id, html5QrcodeScanner);

  useEffect(() => {
    console.log("open");
    initializeScanner();
    return () => {
      console.log("close");
      initializeScanner();
    };
  }, []);

  return <div id={id}></div>;
}

export default SearchView;
