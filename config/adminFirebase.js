import admin from "firebase-admin";

const serviceAccount = require("./binan-health-certificate-firebase-adminsdk-1y2wk-fa53273a59.json");

try {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (error) {
}

export const defaultAdmin = admin;
