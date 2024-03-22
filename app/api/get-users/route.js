import { NextResponse } from "next/server";
import { defaultAdmin } from "@/config/adminFirebase";
import { auth, firestore } from "firebase-admin";

export async function POST(request) {
  const res = await request.json();
  let response = {};
  let uid = "";

  await auth()
    .verifyIdToken(res.token)
    .then((user) => {
      uid = user.uid;
      return firestore().collection("users").doc(uid).get();
    })
    .then((res) => {
      if (res.data().role != "admin") {
        throw new Error("Not admin");
      }
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
      return NextResponse.json(response, { status: 403 });
    });

  await auth()
    .listUsers(25, res.nextPageToken)
    .then((listResult) => {
      response.users = listResult.users.map((user) => {
        return {
          email: user.email,
          uid: user.uid,
          created: user.metadata.creationTime,
        };
      });
      response.nextPageToken = listResult.pageToken;
    });
  return NextResponse.json(response, { status: 200 });
}
