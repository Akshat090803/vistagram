import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/myComponents/header";
import UserProfileSync from "@/components/myComponents/userProfileSync";
import { Toaster } from "sonner";

const inter = Inter({subsets:["latin"]})

export const metadata = {
  title: "Vistagram",
  description: "Instagram for Travellers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}  scroll-smooth`}
      >
        <Toaster richColors={true} />
         <Header/>
      
        <main className="min-h-screen bg-background pt-28">
           {children}
        </main>
      </body>
    </html>
  );
}
