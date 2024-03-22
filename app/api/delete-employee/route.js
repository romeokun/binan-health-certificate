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
                ["byMonth." + data.dateIssued.month.padStart(2, 0)]:
                  doc.get(
                    "byMonth." + data.dateIssued.month.toString().padStart(2, 0)
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

  const employeeRef = firestore().collection("employees").doc(profileID);
  employeeRef
    .get()
    .then((documentSnap) => {
      if (documentSnap.exists) {
        const data = documentSnap.data();
        return firestore().doc(
          "analytics/" + data.created.toDate().getFullYear()
        );
      }
    })
    .then(async (analyticsRef) => {
      await employeeRef.delete();
      await firestore().runTransaction(async (transaction) => {
        return transaction.get(analyticsRef).then((doc) => {
          if (doc.exists) {
            transaction.update(analyticsRef, {
              numberOfNewEmployee: doc.get("numberOfNewEmployee") - 1,
            });
          }
        });
      });
    });

  return NextResponse.json(response, { status: 200 });
}
