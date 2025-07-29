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

// Import Shadcn UI Card components
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
      setLaptopRecommendation(recommendation);
      console.log("💾 Recommendation saved to state");
      
    } catch (error) {
      console.error("❌ Error generating laptop recommendation:", error);
      const fallbackRecommendation = {
        cpu: { model: "AMD Ryzen 7 5800H", generation: "5th Gen", cores: 8, base_clock: "3.2 GHz" },
        ram: { capacity: "16GB", type: "DDR4", speed: "3200MHz" },
        storage: { type: "NVMe SSD", capacity: "1TB", interface: "PCIe 3.0" },
        gpu: { model: "RTX 3060", vram: "6GB", performance_tier: "Mid-range" },
        explanation: "Error occurred while generating AI recommendation. This is a general recommendation...",
        estimated_price_range: "$1000 - $1500"
      };
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
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCurrentStep(1);
    await generateLaptopRecommendation();
    
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setCurrentStep(0);
  };

  const handleStart = () => {
    setShowGameSelection(true);
    setLaptopRecommendation(null);
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

  if (!loading && laptopRecommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Laptop Recommendation
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommended Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Processor (CPU)</h4>
                  <p className="text-lg font-medium">{laptopRecommendation.cpu.model}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.cpu.cores} cores • {laptopRecommendation.cpu.base_clock}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Memory (RAM)</h4>
                  <p className="text-lg font-medium">{laptopRecommendation.ram.capacity} {laptopRecommendation.ram.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.ram.speed}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Storage</h4>
                  <p className="text-lg font-medium">{laptopRecommendation.storage.capacity} {laptopRecommendation.storage.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.storage.interface}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Graphics (GPU)</h4>
                  <p className="text-lg font-medium">{laptopRecommendation.gpu.model}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{laptopRecommendation.gpu.vram} • {laptopRecommendation.gpu.performance_tier}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Why These Specs?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{laptopRecommendation.explanation}</p>
            </CardContent>
          </Card>
          
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardHeader>
              <CardTitle>Estimated Price Range</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{laptopRecommendation.estimated_price_range}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Selected Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedGameData.map((game, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="font-medium text-sm">{game.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{game.requirement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
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
        
        <Loader 
          loadingStates={loadingStates} 
          loading={loading} 
          duration={0}
          currentStep={currentStep}
        />
        
        {!loading && !laptopRecommendation && (
          <Button onClick={handleStart}>
            Click to start
          </Button>
        )}
        
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