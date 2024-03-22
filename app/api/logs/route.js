import { NextResponse } from "next/server";
import { defaultAdmin } from "@/config/adminFirebase";
import { auth, firestore } from "firebase-admin";

export async function POST(request) {
  const res = await request.json();
  let response = {};
  let uid = "";
  let profileID = res.employeeID;

  await auth()
    .verifyIdToken(res.token)
    .then((user) => {
      uid = user.uid;
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
      return NextResponse.json(response, { status: 403 });
    });

    firestore()
    .collection("logs")
    .where("employeeID", "==", profileID)
    .get()

  return NextResponse.json(response, { status: 200 });
}
