import React, {useEffect} from "react";
import QRCode from "qrcode";

function Certificate({ data }) {
  useEffect(() => {
    const canvas = document.getElementById("canvas");

    QRCode.toCanvas(canvas, "binancert-" + data?.id, {width: 220}, function (error) {
      if (error) console.error(error);
    });
  }, []);

  return (
    <div className="border w-[700px] h-[500px] p-[10px] bg-slate-300 grid grid-rows-[100px_70px_1fr]">
      <div className="grid grid-cols-12 place-items-center">
        <div className="bg-red-500 col-span-2 w-[100px] h-[100px] border"></div>
        <div className="bg-blue-500 col-span-8 w-full h-[100px] text-center text-2xl font-bold tracking-tighter leading-none">
          Republic&nbsp;of&nbsp;the&nbsp;Philippines <br />{" "}
          City&nbsp;of&nbsp;Biñan <br /> Province&nbsp;of&nbsp;Laguna
        </div>
      </div>
      <div className="bg-green-500 grid place-content-center text-center leading-none">
        <div className="font-semibold text-lg">Health Certificate</div>
        <div className="text-sm w-[60ch]">
          Pursuant to the provisions of P.D. 856 of sanitation code of the
          Philppines and City Ordinance
        </div>
      </div>
      <div className="grid grid-cols-[60fr_40fr] bg-red-500 h-full">
        <div className="grid grid-rows-[min-content_1fr]">
          <div>
            <div className="grid grid-cols-[min-content_1fr]">
              <div className="grid place-content-center">
                <div className="bg-black border h-[100px] w-[100px] mx-2">
                  {" "}
                  1 x 1
                </div>
              </div>
              <div className="grid content-center">
                <div className="text-sm grid grid-cols-[min-content_1fr]">
                  <div>O.R.&nbsp;No.</div>
                  <div className="border-b-2 border-black mx-4">{data?.or}</div>
                </div>
                <div className="text-sm grid grid-cols-[min-content_1fr]">
                  <div>No.</div>
                  <div className="border-b-2 border-black mx-4">{data?.no}</div>
                </div>
                <div className="text-sm grid grid-cols-[min-content_1fr]">
                  <div>Date&nbsp;Issued</div>
                  <div className="border-b-2 border-black mx-4">
                    {data?.dateIssued}
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
              <span className="mr-2">PLACE&nbsp;OF&nbsp;WORK:</span>
              <span className="border-b-2 border-black">
                {data?.placeOfWork}
              </span>
            </div>
            <div className="text-sm grid grid-cols-[min-content_1fr]">
              <span className="mr-2">COMPANY&nbsp;NAME:</span>
              <span className="border-b-2 border-black">{data?.company}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-xs grid grid-rows-[1fr_min-content]">
              <span className="text-center text-[.6rem] self-end"></span>
              <span className="border-t-2 border-black text-center">
                SIGNATURE&nbsp;OF&nbsp;HOLDER
              </span>
            </div>
            <div className="text-xs grid grid-rows-[1fr_min-content]">
              <span className="text-center text-[.6rem] self-end">
                {data?.issuerName}
              </span>
              <span className="border-t-2 border-black text-center">
                CITY&nbsp;HEALTH&nbsp;OFFICER
              </span>
            </div>
          </div>
        </div>
        <div className="bg-blue-400 h-full grid grid-rows-[1fr_50px]">
          <div className="bg-black border place-self-center w-[220px] h-[220px]">
            <canvas id="canvas" className="w-full"></canvas>
          </div>
          <div className="bg-green-500 grid grid-cols-[min-content_1fr]">
            <div className="mx-2">DATE&nbsp;ISSUANCE</div>
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
  );
}

export default Certificate;
