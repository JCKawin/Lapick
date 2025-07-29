"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ComboBoxResponsive } from "@/components/ui/combobox";
import React, { useState, useEffect } from "react"; 
import Pro from "@/components/ui/pro";
import Newbie from "@/components/ui/new";

const initialImages = [
    "/marquee/acer aspect.png",
    "/marquee/alienware.png",
    "/marquee/asussy.png",
    "/marquee/black.png",
    "/marquee/double screen.png",
    "/marquee/gamer-in-awe.webp",
    "/marquee/glow.png",
    "/marquee/imagen-27.png",
    "/marquee/LGBT lights.png",
    "/marquee/pexels.png",
    "/marquee/prepare for trouble and make it double.png",
    "/marquee/purple.png",
    "/marquee/razor.png",
    "/marquee/sony.png",
    "/marquee/ts kinda tuff.png",
    "/marquee/uwu.png",
    "/marquee/uwu.png",
    "/marquee/ts kinda tuff.png",
    "/marquee/sony.png",
    "/marquee/razor.png",
    "/marquee/purple.png",
    "/marquee/prepare for trouble and make it double.png",
    "/marquee/pexels.png",
    "/marquee/LGBT lights.png",
    "/marquee/imagen-27.png",
    "/marquee/glow.png",
    "/marquee/gamer-in-awe.webp",
    "/marquee/double screen.png",
    "/marquee/black.png",
    "/marquee/asussy.png",
    "/marquee/alienware.png",
    "/marquee/acer aspect.png"
];

// Helper function to shuffle an array
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Home() {
  // 1. Start with an empty array or the initial unshuffled array.
  //    This ensures server and client render the same thing initially.
  const [images, setImages] = useState(initialImages);
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState(null);

  // 2. Use useEffect to shuffle the array only on the client, after mounting.
  useEffect(() => {
    // This code only runs on the client.
    setImages(shuffleArray(initialImages));
    setIsMounted(true);
  }, []); // The empty dependency array [] ensures this runs only once.


  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    console.log("New status:", newStatus);
  };

  if (status) {
    if (status.value === "pro") {
      return <Pro />;
    }
    else {
      return <Newbie />;
    }
  }

  return (
    <>
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-4">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex flex-col items-center justify-center w-full max-w-2xl p-6 h-full">
              <h1 className="text-9xl text-white mb-4 font-thin">L<b className="font-extrabold">a</b>p<b className="font-extrabold">i</b>ck</h1>
            </div>
            <p className="text-white">get started with the fun</p>
            <div className="mt-4">
              <ComboBoxResponsive onStatusChange={handleStatusChange} />
            </div>
          </div>
        </div>

        {/* overlay with radial gradient */}
        <div
          className="absolute inset-0 z-10 h-full w-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 80%)"
          }}
        />

        {/* 3. Conditionally render the marquee only after it's mounted on the client */}
        {/*    This is the safest way to prevent any mismatch. */}
        {isMounted && (
          <ThreeDMarquee
            className="pointer-events-none absolute inset-o h-full w-full"
            images={images}
          />
        )}
      </div>
    </>
  );
}