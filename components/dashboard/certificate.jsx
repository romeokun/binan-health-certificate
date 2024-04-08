"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

import Logo from "@/public/binan-logo.png";
import ISOLogo from "@/public/ISO-logo.png";
import NoProfileImg from "@/public/no-profile-picture-icon.png";
import { ref as refStorage, getDownloadURL } from "firebase/storage";
import { storageDB } from "@/config/firebase";

export const Certificate = React.forwardRef(({ data }, ref) => {
  const defaultTableData = [...Array(9).keys()].map((x, index) => {
    return { key: index + 1, "col-1": "", "col-2": "", "col-3": "" };
  });

  let tableData = [
    {
      key: 0,
      "col-1": "DATE",
      "col-2": "KIND",
      "col-3": "RESULT",
    },
  ];
  if (data.exams) {
    tableData = [...tableData, ...data.exams];
  } else {
    tableData = [...tableData, ...defaultTableData];
  }

  const [photoURL, setPhotoURL] = useState(NoProfileImg);
  useEffect(() => {
    const canvas = document.getElementById("canvas");

    QRCode.toCanvas(
      canvas,
      "binancert-" + data?.id,
      { width: 150 },
      function (error) {
        if (error) console.error(error);
      }
    );

    getDownloadURL(refStorage(storageDB, "photos/" + data.id)) // rename refstorage
      .then((url) => {
        setPhotoURL(url);
      })
      .catch((error) => {
        switch (error.code) {
          case "storage/object-not-found":
            // File doesn't exist
            break;
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect the server response
            break;
        }
      });
  }, []);

  return (
    <div ref={ref} className="w-min">
      <div className="border w-[700px] h-[500px] p-[10px] bg-slate-300 grid grid-rows-[100px_70px_1fr]">
        <div className="grid grid-cols-12 place-items-center place-content-center">
          <div className=" col-span-2 w-[100px] h-[100px] relative">
            <Image src={Logo} fill={true} alt="binan logo" />
          </div>
          <div className=" col-span-8 w-full h-[100px] text-center text-2xl font-bold tracking-tighter leading-none">
            Republic&nbsp;of&nbsp;the&nbsp;Philippines <br />{" "}
            City&nbsp;of&nbsp;Biñan <br /> Province&nbsp;of&nbsp;Laguna
          </div>
          <div className=" col-span-2 w-[100px] h-[100px] relative">
            <Image
              className="object-contain"
              src={ISOLogo}
              fill={true}
              alt="ISO logo"
            />
          </div>
        </div>
        <div className=" grid place-content-center text-center leading-none">
          <div className="font-semibold text-lg">Health Certificate</div>
          <div className="text-sm w-[60ch]">
            Pursuant to the provisions of P.D. 856 of sanitation code of the
            Philppines and City Ordinance
          </div>
        </div>
        <div className="grid grid-cols-[60fr_40fr]  h-full">
          <div className="grid grid-rows-[min-content_1fr]">
            <div>
              <div className="grid grid-cols-[min-content_1fr]">
                <div className="grid place-content-center">
                  <div className=" border h-[100px] w-[100px] mx-2 grid place-content-center relative">
                    <Image
                      src={photoURL}
                      fill={true}
                      alt="1x1 Photo"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="grid content-center">
                  <div className="text-sm grid grid-cols-[min-content_1fr]">
                    <div>O.R.&nbsp;No.</div>
                    <div className="border-b-2 border-black mx-4">
                      {data?.or}
                    </div>
                  </div>
                  <div className="text-sm grid grid-cols-[min-content_1fr]">
                    <div>No.</div>
                    <div className="border-b-2 border-black mx-4">
                      {data?.no}
                    </div>
                  </div>
                  <div className="text-sm grid grid-cols-[min-content_1fr]">
                    <div>Date&nbsp;Issued</div>
                    <div className="border-b-2 border-black mx-4">
                      {data?.dateIssued.full}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">NAME:</span>
                <span className="border-b-2 border-black">
                  {data?.employeeName}
                </span>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">OCCUPATION:</span>
                <span className=" border-b-2 border-black">
                  {data?.occupation}
                </span>
              </div>

              <div className="text-sm grid grid-cols-[min-content_4ch_min-content_4ch] gap-1">
                <span>AGE:</span>
                <span className=" border-b-2 border-black">{data?.age}</span>
                <span>SEX:</span>
                <span className=" border-b-2 border-black">{data?.sex}</span>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">NATIONALITY:</span>
                <span className=" border-b-2 border-black">
                  {data?.nationality}
                </span>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">Category:</span>
                <span className="border-b-2 border-black">
                  {data?.category.charAt(0).toUpperCase() +
                    data?.category.slice(1)}
                </span>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">PLACE&nbsp;OF&nbsp;WORK:</span>
                <span className="border-b-2 border-black">
                  {data?.placeOfWork}
                </span>
              </div>
              <div className="text-sm grid grid-cols-[min-content_1fr]">
                <span className="mr-2">BARANGAY:</span>
                <span className="border-b-2 border-black">
                  {data?.barangay}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 content-stretch place-items-center pt-4">
              <div className="w-[200px] h-full text-xs grid grid-rows-[1fr_min-content]">
                <span className="text-center text-[.6rem] self-end"></span>
                <span className="border-t-2 border-black text-center">
                  SIGNATURE&nbsp;OF&nbsp;HOLDER
                </span>
              </div>
            </div>
          </div>
          <div className=" h-full grid grid-rows-[1fr_min-content_50px]">
            <div className="place-self-center relative">
              <canvas id="canvas" className="w-[100px]"></canvas>
            </div>
            <div className="text-xs grid grid-rows-[1fr_min-content] px-6 mb-4">
              <span className="text-center text-[.6rem] self-end">
                {data?.issuerName}
              </span>
              <span className="border-t-2 border-black text-center">
                CITY&nbsp;HEALTH&nbsp;OFFICER
              </span>
            </div>
            <div className=" grid grid-cols-[min-content_1fr] text-sm">
              <div className="mx-2">DATE&nbsp;OF&nbsp;ISSUANCE</div>
              <div className="border-b-2 border-black text-center">
                {data?.dateIssuance}
              </div>
              <div className="mx-2">DATE&nbsp;EXPIRED</div>
              <div className="border-b-2 border-black text-center">
                {data?.dateIssuance.slice(0, 4)}-12-31
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border w-[700px] h-[500px] p-[10px] bg-slate-300 grid grid-rows-[min-content_min-content_min-content_1fr] mt-2">
        <h1 className="text-center text-lg underline">IMPORTANT</h1>
        <div className="p-2">
          THIS HEALTH CERTIFICATE IS NON-TRANSFERABLE. VALID ONLY UNTIL THE NEXT
          DATE OF EXAMINATION, AS INDICATED. THIS CARD SHOULD BE CLIPPED IN THE
          UPPER LEFT FRONT PORTION AT THE GARMENT OF THE HOLDER WHILE WORKING.
        </div>
        <div className="text-center">X-RAY/STOOL/OTHER EXAM</div>
        <table className="text-center">
          <tbody>
            {tableData.map((x) => {
              return (
                <tr className="h-[28px]" key={x.key}>
                  <td
                    className={
                      "border border-black " + (x.key == 0 ? "font-bold" : "")
                    }
                  >
                    {x["col-1"]}
                  </td>
                  <td
                    className={
                      "border border-black " + (x.key == 0 ? "font-bold" : "")
                    }
                  >
                    {x["col-2"]}
                  </td>
                  <td
                    className={
                      "border border-black " + (x.key == 0 ? "font-bold" : "")
                    }
                  >
                    {x["col-3"]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

Certificate.displayName = "Certificate";
