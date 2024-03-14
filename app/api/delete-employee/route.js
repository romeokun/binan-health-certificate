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
    });

  firestore()
    .collection("records")
    .where("employee", "==", profileID)
    .get()
    .then((snap) => {
      snap.forEach((record) => {
        record.ref.delete()
      });
    });

   await firestore().collection("employees").doc(profileID).delete()

  return NextResponse.json(response, { status: 200 });
}
