import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers/Providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Tokyo Kageru",
  description: "Collect Tokyo Kageru NFT's for free on Arbitrum.",
  twitter: {
    card: "summary_large_image",
    title: "Foundnone Collectibles",
    images: "https://ipfs.io/ipfs/QmT6mLau18kqib6WPeZ9RYa4EZrVtjYdGFNcdjppTqZtmB",
  },
  openGraph: {
    images: ["https://ipfs.io/ipfs/QmT6mLau18kqib6WPeZ9RYa4EZrVtjYdGFNcdjppTqZtmB"],
    title: "Tokyo Kageru",
    description: "Collect Tokyo Kageru NFT's for free on Arbitrum.",
    type: "website",
    url: "https://collect.foundnone.xyz",
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


