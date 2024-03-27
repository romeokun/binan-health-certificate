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
    .createUser({ email: res.email, displayName: res.name, password: res.password })
    .then(async (newUser) => {
      await firestore()
        .collection("users")
        .doc(newUser.uid)
        .set({ name: res.name, role: res.role });

      await firestore()
        .collection("logs")
        .add({
          created: firestore.Timestamp.now(),
          action: { text: "created a new user", value: "user_add" },
          target: newUser.uid,
          userUID: uid,
        });
    });
  return NextResponse.json(response, { status: 200 });
}
