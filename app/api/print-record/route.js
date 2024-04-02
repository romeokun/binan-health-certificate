import { NextResponse } from "next/server";
import { defaultAdmin } from "@/config/adminFirebase";
import { auth, firestore } from "firebase-admin";
import { headers } from "@/next.config";
import { data } from "autoprefixer";

export async function POST(request) {
  const res = await request.json();
  let response = {};
  let uid = "";

  await auth()
    .verifyIdToken(res.token)
    .then((user) => {
      uid = user.uid;
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
      return NextResponse.json(response, { status: 403 });
    });

  // handle return csv
  console.log("writing");
  response.print =
    "No.\tName\tGender\tPlace Of Work\tBarangay\tCategory\tIssuance\n";

  let chain = firestore().collection("records");

  if (res.month) {
    chain = chain.where("dateIssued.month", "==", res.month);
  }
  if (res.year) {
    chain = chain.where("dateIssued.year", "==", res.year);
  }
  if (res.company) {
    chain = chain.where("placeOfWork", "==", res.company);
  }

  await chain
    .orderBy("created", "desc")
    .get()
    .then((snap) => {
      snap.forEach((x) => {
        response.print = response.print.concat(
          x.data().no +
            "\t" +
            x.data().employeeName +
            "\t" +
            x.data().sex +
            "\t" +
            x.data().placeOfWork +
            "\t" +
            x.data().barangay +
            "\t" +
            x.data().category +
            "\t" +
            x.data().dateIssuance +
            "\n"
        );
      });
    });

  return NextResponse.json(response, { status: 200 });
}
