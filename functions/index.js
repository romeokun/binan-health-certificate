/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.printRecords = onRequest({ cors: true }, async (request, response) => {
  logger.log("body: ", request.body.company)
  if (request.method == "POST") {
    let result = {};
    let uid = "";

    let idToken;
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = request.headers.authorization.split("Bearer ")[1];
    }

    await admin
      .auth()
      .verifyIdToken(idToken)
      .then((user) => {
        uid = user.uid;
      })
      .catch((error) => {
        console.log("Error fetching user data:", error);
        result.status = 403;
        response.json(result);
      });
    if ((result.status == 403)) {
      return;
    }

    // handle return csv
    response.print =
      "No.\tName\tGender\tPlace Of Work\tBarangay\tCategory\tIssuance\n";

    let chain = getFirestore().collection("records");

    if (request.body.month) {
      chain = chain.where("dateIssued.month", "==", request.body.month);
    }
    if (request.body.year) {
      chain = chain.where("dateIssued.year", "==", request.body.year);
    }
    if (request.body.company) {
      chain = chain.where("placeOfWork", "==", request.body.company);
    }

    await chain
      .orderBy("created", "desc")
      .get()
      .then((snap) => {
        const arr = [];
        snap.forEach((x) => {
          const { created, exams, employee, ...tmp } = x.data();
          tmp.dateIssued = tmp.dateIssued.full;

          arr.push(tmp);
        });
        result.print = arr;
        result.status = 200;
      });
    response.json(result);
    return;
  }
  response.json({ status: 500 });
  return;
});
