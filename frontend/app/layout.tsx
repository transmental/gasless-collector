import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers/Providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Foundnone Collectibles",
  description: "Collect Foundnone NFT's for free on Arbitrum.",
  twitter: {
    card: "summary_large_image",
    title: "Foundnone Collectibles",
    images: "",
  },
  openGraph: {
    images: [""],
    title: "Foundnone Collectibles",
    description: "Collect Foundnone NFT's for free on Arbitrum.",
    type: "website",
    url: "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}


