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

  let status = 200;
  await auth()
    .deleteUser(res.id)
    .then(() => {
      return firestore().collection("users").doc(res.id).get();
    })
    .then((data) => {
      return firestore()
        .collection("logs")
        .add({
          created: firestore.Timestamp.now(),
          action: { text: "deleted a user", value: "user_delete" },
          data: data.data(),
          target: res.id,
          userUID: uid,
        });
    })
    .catch((error) => {
      status = 403;
      console.log(error);
    });
  return NextResponse.json(response, { status: status });
}
