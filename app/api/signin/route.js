import { NextResponse } from "next/server";
import { defaultAdmin } from "@/config/adminFirebase";

export async function GET() {
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
export async function POST(request) {
  const res = await request.json();
  let response = {}
  if (res.uid) {
    await defaultAdmin
      .auth()
      .getUser(res.uid)
      .then((userRecord) => {
        response = userRecord

        console.log(userRecord.customClaims);
      })
      .catch((error) => {
        console.log("Error fetching user data:", error);
      });
  }
  return NextResponse.json(response, { status: 200 });
}
