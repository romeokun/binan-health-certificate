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
    .where("employeeID", "==", profileID)
    .get()
    .then((snap) => {
      snap.forEach(async (record) => {
        const docRef = record.ref;
        const data = record.data();
        const analyticsRef = firestore().doc(
          "analytics/" + data.dateIssued.year
        );

        await firestore().runTransaction((transaction) => {
          return transaction.get(analyticsRef).then((doc) => {
            if (doc.exists) {
              transaction.update(analyticsRef, {
                numberOfCertificates: doc.get("numberOfCertificates") - 1,
                ["baranggay." + data.placeOfWork]:
                  doc.get("baranggay." + data.placeOfWork) - 1,
                ["byMonth." +
                data.dateIssued.month.padStart(2, 0)]:
                  doc.get(
                    "byMonth." +
                    data.dateIssued.month.toString().padStart(2, 0)
                  ) - 1,
                ["nationality." + data.nationality]:
                  doc.get("nationality." + data.nationality) - 1,
              });
            }
          });
        });

        docRef.delete();
      });
    });

  await firestore().collection("employees").doc(profileID).delete();

  return NextResponse.json(response, { status: 200 });
}
