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
  let oldData = null;
  await auth()
    .updateUser(res.id, {
      displayName: res.name,
    })
    .then(async () => {
      const userRef = firestore().collection("users").doc(res.id);
      await userRef.get().then((data) => (oldData = data.data()));
      await userRef.update({ name: res.name, role: res.role });
      return userRef.get()
    })
    .then((newData) => {
      return firestore()
        .collection("logs")
        .add({
          created: firestore.Timestamp.now(),
          action: { text: "updated a user", value: "user_update" },
          data: { new: newData.data(), old: oldData },
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
