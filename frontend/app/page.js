"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ComboBoxResponsive } from "@/components/ui/combobox";
import React from "react";

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
    "/marquee/acer aspect.png",

];

export default function Home() {
  const [images, setImages] = React.useState(initialImages);
  const [status, setStatus] = React.useState(null);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    console.log("New status:", newStatus);
  };

  return (
    <>
    <div className="relative flex h-screen bg-black  w-full flex-col items-center justify-center overflow-hidden ">
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-4">
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl p-6 h-full">
          <h1 className="text-9xl text-white mb-4 font-thin">L<b className="font-extrabold">a</b>p<b className="font-extrabold">i</b>ck
          </h1>
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
      <ThreeDMarquee
        className="pointer-events-none absolute inset-o h-full w-full"
        images={images}
      />
    </div>
      
    </>
  );
}