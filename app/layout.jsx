import { Roboto_Mono } from "next/font/google";
import "./globals.css";

import { AuthUser } from "@/components/auth-provider";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Health Certificate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={robotoMono.className}>
        <AuthUser>{children}</AuthUser>
      </body>
    </html>
  );
}
