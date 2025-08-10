import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/myComponents/header";
import UserProfileSync from "@/components/myComponents/userProfileSync";

const inter = Inter({subsets:["latin"]})

export const metadata = {
  title: "Vistagram",
  description: "Travel Instagram",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}  scroll-smooth`}
      >
         <Header/>
         {/* <UserProfileSync/> */}
        {/* <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-30"> */}
        <main className="min-h-screen bg-background pt-30">
           {children}
        </main>
      </body>
    </html>
  );
}
