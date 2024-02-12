import React, { useEffect, useId } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

async function loadQuery(docID, setCertificate) {
  try {
    const docRef = doc(db, "certificates", docID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:",docSnap);
      setCertificate(docSnap);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error(error);
  }
}

function SearchView({ changeModalView, setCertificate }) {
  let html5QrcodeScanner;

  function initializeScannerClosure() {
    let hasBeenCalled = false;
    return (componentId) => {
      if (!hasBeenCalled) {
        try {
          html5QrcodeScanner = new Html5QrcodeScanner(
            componentId,
            { fps: 10, qrbox: 250 },
            /* verbose= */ false
          );
        } catch (error) {
          console.error(error);
        }

        html5QrcodeScanner.render(onScanSuccess);
        hasBeenCalled = true;
      }
    };
  }
  const initializeScanner = initializeScannerClosure();

  function onScanSuccess(decodedText, decodedResult) {
    loadQuery(decodedText, setCertificate);
    changeModalView("view");
  }

  const id = useId();
  useEffect(() => {
    initializeScanner(id);
    return () => {};
  }, []);

  return <div id={id}></div>;
}

export default SearchView;
