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
  let html5QrcodeScanner;

  function initializeScannerClosure() {
    let isRendered = false;
    let hasBeenCalled = false;
    return (componentId, bool) => {
      if (!hasBeenCalled) {
        try {
          html5QrcodeScanner = new Html5QrcodeScanner(
            componentId,
            { fps: 10, qrbox: 250 },
            /* verbose= */ false
          );

          hasBeenCalled = true;
        } catch (error) {
          console.error(error);
        }
      }
      console.log("render: ", bool === true && !isRendered);
      if (bool === true && !isRendered) {
        html5QrcodeScanner.render(onScanSuccess);
        isRendered = true;
      } else {
        html5QrcodeScanner.clear();
        isRendered = false;
      }
    };
  }
  const initializeScanner = initializeScannerClosure();

  function onScanSuccess(decodedText, decodedResult) {
    let result = decodedText.split("-");
    if (result[0] === "binancert") {
      loadQuery(result[1], setCertificate, changeModalView);
    } else {
      console.log("qr is not binancert");
    }
  }

  const id = useId();
  useEffect(() => {
    console.log("open");
    initializeScanner(id, true);
    return () => {
      console.log("close");
      initializeScanner(id, false);
    };
  }, []);

  return <div id={id}></div>;
}

export default SearchView;
