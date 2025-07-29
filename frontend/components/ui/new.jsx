"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { Button } from "./button";

const loadingStates = [
  {
    text: "Buying a condo",
  },
  {
    text: "Travelling in a flight",
  },
  {
    text: "Meeting Tyler Durden",
  },
  {
    text: "He makes soap",
  },
  {
    text: "We goto a bar",
  },
  {
    text: "Start a fight",
  },
  {
    text: "We like it",
  },
  {
    text: "Welcome to F**** C***",
  },
];

export default function Newbie() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < loadingStates.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStartLoading = () => {
    setLoading(true);
    setCurrentStep(0);
  };

  const handleStopLoading = () => {
    setLoading(false);
    setCurrentStep(0);
  };

  return (
    <>
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          Lets start
        </h2>
        
        {/* Core Loader Modal */}
        <Loader 
          loadingStates={loadingStates} 
          loading={loading} 
          currentStep={currentStep}
          duration={0} // No automatic progression
        />
        
        {/* Start button */}
        {!loading && (
          <Button onClick={handleStartLoading}>
            Click to start
          </Button>
        )}

        {/* Next step button - only show when loading and not at the last step */}
        {loading && currentStep < loadingStates.length - 1 && (
          <Button 
            onClick={handleNextStep}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[120]"
          >
            Next Step ({currentStep + 1}/{loadingStates.length})
          </Button>
        )}

        {/* Close button */}
        {loading && (
          <button
            className="fixed top-4 right-4 text-black dark:text-white z-[120]"
            onClick={handleStopLoading}
          >
            <IconSquareRoundedX className="h-10 w-10" />
          </button>
        )}
      </div>
    </>
  );
}