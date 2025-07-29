"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { Button } from "./button";
import { GameSelection } from "./GameSelection";
import { 
  gpuIntensiveGames, 
  esportsTitles, 
  CloseIcon 
} from "./gameData";

// Import instructor and openai
import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai";
import { z } from "zod";

// Define the Zod schema for laptop recommendations
const LaptopRecommendationSchema = z.object({
  cpu: z.object({
    model: z.string().describe("CPU model like Ryzen 7 5800H, Intel i7-11800H"),
    generation: z.string().describe("CPU generation"),
    cores: z.number().describe("Number of cores"),
    base_clock: z.string().describe("Base clock speed")
  }),
  ram: z.object({
    capacity: z.string().describe("RAM capacity like 16GB, 32GB"),
    type: z.string().describe("RAM type like DDR4, DDR5"),
    speed: z.string().describe("RAM speed like 3200MHz")
  }),
  storage: z.object({
    type: z.string().describe("Storage type like SSD, NVMe SSD"),
    capacity: z.string().describe("Storage capacity like 512GB, 1TB"),
    interface: z.string().describe("Storage interface")
  }),
  gpu: z.object({
    model: z.string().describe("GPU model"),
    vram: z.string().describe("VRAM capacity"),
    performance_tier: z.string().describe("Performance tier like entry-level, mid-range, high-end")
  }),
  explanation: z.string().describe("Detailed explanation of why these specs are recommended for the selected games"),
  estimated_price_range: z.string().describe("Estimated price range for laptops with these specifications")
});

// Initialize OpenAI client
const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Make sure to set this in your .env file
  dangerouslyAllowBrowser: true // Only for client-side usage in development
});

// Initialize Instructor
const client = Instructor({
  client: openai,
  mode: "FUNCTIONS"
});

export default function Newbie() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedGameData, setSelectedGameData] = useState([]);
  const [laptopRecommendation, setLaptopRecommendation] = useState(null);
  const [isGeneratingRecommendation, setIsGeneratingRecommendation] = useState(false);

  // Updated loading states
  const loadingStates = [
    {
      element: (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Analyzing your game selection</span>
        </div>
      ),
    },
    {
      element: (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-medium">Consulting AI for optimal laptop specs</span>
        </div>
      ),
    },
    {
      element: (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-medium">Generating personalized recommendations</span>
        </div>
      ),
    },
    {
      element: (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Recommendation complete!</span>
        </div>
      ),
    }
  ];

  React.useEffect(() => {
    console.log(selectedGames)
  }, [selectedGames]);

  React.useEffect(() => {
    const data = selectedGames.map(gameId => {
      const [category, index] = gameId.split('-');
      const gameIndex = parseInt(index);
      let gameSource;
      if (category === "GPU Intensive Games") {
        gameSource = gpuIntensiveGames;
      } else {
        gameSource = esportsTitles;
      }
      const game = gameSource[gameIndex];
      return { ...game, category, id: gameId };
    });
    setSelectedGameData(data);
  }, [selectedGames]);

  const generateLaptopRecommendation = async () => {
    console.log("🚀 Starting laptop recommendation generation...");
    setIsGeneratingRecommendation(true);
    
    try {
      // Prepare the game data for the AI
      const gameNames = selectedGameData.map(game => game.name);
      const gameRequirements = selectedGameData.map(game => `${game.name}: ${game.requirement}`);
      
      console.log("🎮 Selected games:", gameNames);
      console.log("📋 Game requirements:", gameRequirements);
      
      const prompt = `
        Based on the following selected games and their requirements, recommend optimal laptop specifications for gaming:
        
        Selected Games: ${gameNames.join(', ')}
        
        Game Requirements:
        ${gameRequirements.join('\n')}
        
        Please provide detailed laptop specifications that can handle all these games comfortably.
        Consider that this is for a laptop, so focus on mobile processors and GPUs. 
        Ensure the recommendations can handle all selected games with good performance and some future-proofing.
      `;

      console.log("📝 Sending prompt to OpenAI...");
      console.log("Prompt:", prompt);

      const recommendation = await client.chat.completions.create({
        model: "gemma2-9b-it",
        messages: [
          {
            role: "system",
            content: "You are a laptop hardware expert specializing in gaming laptops. Provide accurate, practical recommendations based on game requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_model: {
          schema: LaptopRecommendationSchema,
          name: "LaptopRecommendation"
        },
        max_retries: 2,
        temperature: 0.1
      });

      console.log("✅ Received recommendation from AI:");
      console.log("Raw response:", recommendation);
      console.log("CPU:", recommendation.cpu);
      console.log("RAM:", recommendation.ram);
      console.log("Storage:", recommendation.storage);
      console.log("GPU:", recommendation.gpu);
      console.log("Explanation:", recommendation.explanation);
      console.log("Price Range:", recommendation.estimated_price_range);

      setLaptopRecommendation(recommendation);
      console.log("💾 Recommendation saved to state");
      
    } catch (error) {
      console.error("❌ Error generating laptop recommendation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Set a fallback recommendation
      const fallbackRecommendation = {
        cpu: {
          model: "AMD Ryzen 7 5800H",
          generation: "5th Gen",
          cores: 8,
          base_clock: "3.2 GHz"
        },
        ram: {
          capacity: "16GB",
          type: "DDR4",
          speed: "3200MHz"
        },
        storage: {
          type: "NVMe SSD",
          capacity: "1TB",
          interface: "PCIe 3.0"
        },
        gpu: {
          model: "RTX 3060",
          vram: "6GB",
          performance_tier: "Mid-range"
        },
        explanation: "Error occurred while generating AI recommendation. This is a general recommendation for gaming laptops that should handle most modern games at 1080p with good performance. The Ryzen 7 5800H provides excellent multi-core performance, 16GB RAM ensures smooth multitasking, and the RTX 3060 can run most games at high settings.",
        estimated_price_range: "$1000 - $1500"
      };
      
      console.log("🔄 Using fallback recommendation:", fallbackRecommendation);
      setLaptopRecommendation(fallbackRecommendation);
    } finally {
      setIsGeneratingRecommendation(false);
      console.log("🏁 Recommendation generation complete");
    }
  };

  const handleGameToggle = (gameId) => {
    setSelectedGames((prev) => {
      if (prev.includes(gameId)) {
        return prev.filter((id) => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const handleGameSelectionNext = async () => {
    setShowGameSelection(false);
    setLoading(true);
    setCurrentStep(0);
    
    // Generate laptop recommendation when starting the loading process
    await generateLaptopRecommendation();
  };

  const handleNextStep = () => {
    if (currentStep < loadingStates.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If we've reached the last step, we can either reset or stop
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // Go back to game selection
      setLoading(false);
      setShowGameSelection(true);
    }
  };

  const handleStart = () => {
    setShowGameSelection(true);
  };

  const handleStop = () => {
    setLoading(false);
    setShowGameSelection(false);
    setCurrentStep(0);
    setSelectedGames([]);
    setSelectedGameData([]);
    setLaptopRecommendation(null);
  };

  const handleGameSelectionBack = () => {
    setShowGameSelection(false);
    setSelectedGames([]);
    setSelectedGameData([]);
  };

  // Show game selection screen
  if (showGameSelection) {
    return (
      <GameSelection 
        selectedGames={selectedGames}
        selectedGameData={selectedGameData}
        onGameToggle={handleGameToggle}
        onNext={handleGameSelectionNext}
        onBack={handleGameSelectionBack}
      />
    );
  }

  // Show laptop recommendation when loading is complete
  if (!loading && laptopRecommendation && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Laptop Recommendation
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recommended Specifications</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* CPU */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Processor (CPU)</h4>
                <p className="text-lg font-medium">{laptopRecommendation.cpu.model}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.cpu.cores} cores • {laptopRecommendation.cpu.base_clock}</p>
              </div>
              
              {/* RAM */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Memory (RAM)</h4>
                <p className="text-lg font-medium">{laptopRecommendation.ram.capacity} {laptopRecommendation.ram.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.ram.speed}</p>
              </div>
              
              {/* Storage */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Storage</h4>
                <p className="text-lg font-medium">{laptopRecommendation.storage.capacity} {laptopRecommendation.storage.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.storage.interface}</p>
              </div>
              
              {/* GPU */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Graphics (GPU)</h4>
                <p className="text-lg font-medium">{laptopRecommendation.gpu.model}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.gpu.vram} • {laptopRecommendation.gpu.performance_tier}</p>
              </div>
            </div>
          </div>
          
          {/* Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Why These Specs?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{laptopRecommendation.explanation}</p>
          </div>
          
          {/* Price Range */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">Estimated Price Range</h3>
            <p className="text-2xl font-bold">{laptopRecommendation.estimated_price_range}</p>
          </div>
          
          {/* Selected Games */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Selected Games</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedGameData.map((game, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="font-medium text-sm">{game.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{game.requirement}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={handleStart}>
              Start Over
            </Button>
            <Button onClick={handleStop}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          Let's start
        </h2>
        
        {/* Core Loader Modal */}
        <Loader 
          loadingStates={loadingStates} 
          loading={loading} 
          duration={0}
          currentStep={currentStep}
        />
        
        {/* Start button */}
        {!loading && !laptopRecommendation && (
          <Button onClick={handleStart}>
            Click to start
          </Button>
        )}
        
        {/* Navigation buttons */}
        {loading && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[120] flex gap-3">
            <Button 
              variant="outline"
              onClick={handlePreviousStep}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <Button onClick={handleNextStep}>
              {currentStep < loadingStates.length - 1 ? "Next Step" : "View Results"}
            </Button>
          </div>
        )}
        
        {/* Close button */}
        {loading && (
          <button
            className="fixed top-4 right-4 text-black dark:text-white z-[120]"
            onClick={handleStop}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </>
  );
}