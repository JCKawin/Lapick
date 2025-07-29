import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  gpuIntensiveGames,
  esportsTitles,
  visualEffects2D,
  visualEffects3D,
  gameDevelopment,
  renderingEngine,
  softwareDevelopment,
  dataScience,
  cybersecurity,
  cadEngineering,
  videoEditing,
  audioProduction,
  vtubingStreaming,
  vtuberModelCreation,
  writingPublishing,
  virtualization,
  financeTrading,
} from "./gameData";

// Game Selection Component
export const GameSelection = ({ selectedGames, selectedGameData, onGameToggle, onNext, onBack }) => {
  const getRequirementColor = (requirement) => {
    if (!requirement) return "";
    if (requirement.includes("RTX 4060 8GB")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (requirement.includes("RTX 4050 6GB")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    if (requirement.includes("RTX 3050 4GB")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    if (requirement.includes("RTX 2050 4GB")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  const transformSoftware = (softwareArray) => softwareArray.map(name => ({ name }));

  const renderGameCards = (games, title) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, index) => {
          const gameId = `${title}-${index}`;
          const isSelected = selectedGames.includes(gameId);
          
          return (
            <Card 
              key={gameId}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected 
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" 
                  : "hover:shadow-md"
              )}
              onClick={() => onGameToggle(gameId)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium leading-tight">
                  {game.name}
                </CardTitle>
              </CardHeader>
              {game.requirement && (
                <CardContent className="pt-0">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", getRequirementColor(game.requirement))}
                  >
                    {game.requirement}
                  </Badge>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  const softwareSections = {
    "Visual Effects": {
      "2D Design": visualEffects2D,
      "3D Design": visualEffects3D,
    },
    "Game Development": {
      "Game Development": gameDevelopment,
      "Rendering Engine": renderingEngine,
    },
    "Software Categories (Additional)": {
      "Software Development": softwareDevelopment,
      "Data Science / Machine Learning": dataScience,
      "Cybersecurity / Pentesting": cybersecurity,
      "CAD / Engineering / Simulation": cadEngineering,
      "Video Editing / Motion Graphics": videoEditing,
      "Audio / Music Production": audioProduction,
      "VTubing / Streaming / Face Tracking": vtubingStreaming,
      "VTuber Model Creation / Avatar Rigging": vtuberModelCreation,
      "Writing / Publishing / Research": writingPublishing,
      "Virtualization / VMs": virtualization,
      "Finance / Trading": financeTrading,
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Games & Software
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select the games and software you want to use. We'll recommend the best hardware for your selection.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Selected: {selectedGames.length} items
            </p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Selected Games Summary */}
        {selectedGameData.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Selected Items ({selectedGameData.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedGameData.map((game) => (
                <Badge 
                  key={game.id} 
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                >
                  {game.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {renderGameCards(gpuIntensiveGames, "GPU Intensive Games")}
        {renderGameCards(esportsTitles, "Esports Titles")}

        {Object.entries(softwareSections).map(([sectionTitle, subsections]) => (
          <div key={sectionTitle}>
            <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900 dark:text-white">{sectionTitle}</h2>
            {Object.entries(subsections).map(([subsectionTitle, softwareList]) => (
              <React.Fragment key={subsectionTitle}>
                {renderGameCards(transformSoftware(softwareList), subsectionTitle)}
              </React.Fragment>
            ))}
          </div>
        ))}

        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={onNext}
            disabled={selectedGames.length === 0}
            size="lg"
            className="shadow-lg"
          >
            Continue ({selectedGames.length} selected)
          </Button>
        </div>
      </div>
    </div>
  );
};
