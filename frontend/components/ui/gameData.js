// Game data
export const gpuIntensiveGames = [
  { name: "Call of Duty", requirement: "RTX 3050 4GB" },
  { name: "Expedition 33", requirement: "RTX 3050 4GB" },
  { name: "Borderland", requirement: "RTX 3050 4GB" },
  { name: "GTA 5", requirement: "RTX 2050 4GB" },
  { name: "Cyberpunk 2077", requirement: "RTX 4050 6GB" },
  { name: "Red Dead Redemption 2", requirement: "RTX 3050 4GB" },
  { name: "Microsoft Flight Simulator", requirement: "RTX 4060 8GB" },
  { name: "Control", requirement: "RTX 3050 4GB" },
  { name: "Crysis Remastered", requirement: "RTX 3050 4GB" },
  { name: "Forza Horizon 5", requirement: "RTX 3050 4GB" },
  { name: "Assassin's Creed Valhalla", requirement: "RTX 3050 4GB" },
  { name: "Metro Exodus", requirement: "RTX 3050 4GB" },
  { name: "Battlefield V", requirement: "RTX 2050 4GB" },
  { name: "Far Cry 6", requirement: "RTX 3050 4GB" },
  { name: "The Witcher 3: Wild Hunt", requirement: "RTX 3050 4GB" },
  { name: "Horizon Zero Dawn", requirement: "RTX 3050 4GB" },
  { name: "Death Stranding", requirement: "RTX 3050 4GB" },
  { name: "DOOM Eternal", requirement: "RTX 3050 4GB" },
  { name: "Shadow of the Tomb Raider", requirement: "RTX 3050 4GB" },
  { name: "Star Wars Jedi: Survivor", requirement: "RTX 4060 8GB" },
  { name: "Alan Wake 2", requirement: "RTX 4060 8GB" },
  { name: "Resident Evil Village", requirement: "RTX 3050 4GB" },
  { name: "Ghost Recon Breakpoint", requirement: "RTX 3050 4GB" },
  { name: "Watch Dogs: Legion", requirement: "RTX 3050 4GB" },
  { name: "Ghost of Tsushima", requirement: "RTX 3050 4GB" },
];

export const esportsTitles = [
  { name: "Counter-Strike: Global Offensive", requirement: "AMD iGPU" },
  { name: "League of Legends", requirement: "AMD iGPU" },
  { name: "Dota 2", requirement: "AMD iGPU" },
  { name: "Valorant", requirement: "AMD iGPU" },
  { name: "Overwatch", requirement: "RTX 2050 4GB" },
  { name: "Rocket League", requirement: "AMD iGPU" },
  { name: "Rainbow Six Siege", requirement: "RTX 2050 4GB" },
  { name: "StarCraft II", requirement: "AMD iGPU" },
  { name: "Call of Duty: Warzone", requirement: "RTX 3050 4GB" },
  { name: "Apex Legends", requirement: "RTX 3050 4GB" },
  { name: "PUBG: Battlegrounds", requirement: "RTX 3050 4GB" },
  { name: "Fortnite", requirement: "AMD iGPU" },
  { name: "Hearthstone", requirement: "AMD iGPU" },
  { name: "FIFA", requirement: "RTX 2050 4GB" },
  { name: "Street Fighter V", requirement: "AMD iGPU" },
  { name: "Heroes of the Storm", requirement: "AMD iGPU" },
  { name: "Paladins", requirement: "AMD iGPU" },
  { name: "Smite", requirement: "AMD iGPU" },
  { name: "World of Tanks", requirement: "RTX 2050 4GB" },
  { name: "Magic: The Gathering Arena", requirement: "AMD iGPU" },
  { name: "NBA 2K", requirement: "RTX 2050 4GB" },
  { name: "Quake Champions", requirement: "RTX 2050 4GB" },
  { name: "Team Fortress 2", requirement: "AMD iGPU" },
  { name: "CrossFire", requirement: "AMD iGPU" },
];

// Loading states for the multi-step loader

// Icon components
export const CheckIcon = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-6 h-6 ", className)}>
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

export const CheckFilled = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6 ", className)}>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd" />
    </svg>
  );
};

export const HomeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

export const PlaneIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

export const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

export const SoapIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8-.128 1.828a1.125 1.125 0 0 1-1.122 1.047H5.45a1.125 1.125 0 0 1-1.122-1.047L4.2 15.3m15.6 0a2.25 2.25 0 0 0 .2-1.3V8.077a5.25 5.25 0 0 0-2.416-4.403C16.01 2.52 14.11 2.25 12 2.25s-4.01.27-5.584 1.424A5.25 5.25 0 0 0 4 8.077V14c0 .442.06.875.2 1.3" />
  </svg>
);

export const GlassIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-3.97-3.97a18.984 18.984 0 0 0-5.06-3.993c-.646-.306-1.052-.236-1.15.55-.097.787-.404 1.688-.728 2.547-.324.859-.867 1.824-1.867 2.032-.746.155-1.867-.414-2.32-.671-.453-.257-1.867-.414-2.32-.671L3 21.75" />
  </svg>
);

export const FistIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-5 h-5", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
  </svg>
);

export const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={cn("w-5 h-5", className)}>
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </svg>
);

export const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={cn("w-5 h-5", className)}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

export const CloseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={cn("w-10 h-10", className)}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const loadingStates = [
  {
    element: (
      <div className="flex items-center gap-2">
        <HomeIcon className="text-blue-500" />
        <span className="font-medium">Analyzing your game selection</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <PlaneIcon className="text-green-500" />
        <span className="font-medium">Travelling in a flight</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <UserIcon className="text-purple-500" />
        <span className="font-medium">Meeting Tyler Durden</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <SoapIcon className="text-pink-500" />
        <span className="font-medium">He makes soap</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <GlassIcon className="text-yellow-500" />
        <span className="font-medium">We goto a bar</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <FistIcon className="text-red-500" />
        <span className="font-medium">Start a fight</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <HeartIcon className="text-orange-500" />
        <span className="font-medium">We like it</span>
      </div>
    ),
  },
  {
    element: (
      <div className="flex items-center gap-2">
        <StarIcon className="text-indigo-500" />
        <span className="font-bold text-lg">Welcome to F**** C***</span>
      </div>
    ),
  },
];

// Add missing cn import
import { cn } from "@/lib/utils";

// Visual Effects

export const visualEffects2D = [
  "Photoshop",
  "Krita",
  "GIMP",
  "Inkscape",
  "Procreate",
  "Illustrator",
  "Animate",
  "Clip Studio Paint",
  "Aseprite",
  "DragonBones",
  "Spine 2D",
  "TVPaint",
];

export const visualEffects3D = [
  "Blender",
  "Houdini",
  "Maya",
  "3ds Max",
  "Cinema 4D",
  "Substance Painter 3D",
  "SketchUp",
  "ZBrush",
  "Marvelous Designer",
];

export const gameDevelopment = [
  "Unreal Engine",
  "Unity",
  "Godot",
  "CryEngine",
  "Frostbite",
  "RPG Maker",
  "GameMaker Studio",
  "Construct 3",
];

export const renderingEngine = [
  "RenderMan",
  "Cycles",
  "Corona",
  "Arnold",
  "V-Ray",
  "Redshift",
];

// Software Categories (Additional)

export const softwareDevelopment = [
  "VS Code",
  "IntelliJ IDEA",
  "PyCharm",
  "Android Studio",
  "Eclipse",
  "Xcode",
  "Git",
  "Docker",
];

export const dataScience = [
  "Jupyter Notebook",
  "TensorFlow",
  "PyTorch",
  "RStudio",
  "Anaconda",
  "MATLAB",
];

export const cybersecurity = [
  "Kali Linux",
  "Wireshark",
  "Burp Suite",
  "VirtualBox",
  "Metasploit",
  "Nmap",
  "Hashcat",
  "John the Ripper",
];

export const cadEngineering = [
  "AutoCAD",
  "SolidWorks",
  "Revit",
  "ANSYS",
  "COMSOL",
  "LabVIEW",
  "MATLAB",
  "Mathematica",
];

export const videoEditing = [
  "Adobe Premiere Pro",
  "DaVinci Resolve",
  "After Effects",
  "Final Cut Pro",
];

export const audioProduction = [
  "FL Studio",
  "Ableton Live",
  "Pro Tools",
  "Cubase",
  "Logic Pro",
  "Reaper",
  "Audacity",
  "Adobe Audition",
  "Voicemeeter",
];

export const vtubingStreaming = [
  "OBS Studio",
  "Streamlabs",
  "VTube Studio",
  "VSeeFace",
  "VBridger",
  "Luppet",
  "iFacialMocap",
  "Twitch",
  "YouTube Live",
  "Elgato Game Capture",
];

export const vtuberModelCreation = [
  "Live2D Cubism",
  "VUP",
  "Animaze",
  "3tene",
];

export const writingPublishing = [
  "Obsidian",
  "Notion",
  "Scrivener",
  "Trelby",
  "LaTeX (TeXstudio / Overleaf)",
  "Zotero",
  "Mendeley",
  "EndNote",
  "Grammarly",
  "Twine",
  "World Anvil",
  "Campfire",
];

export const virtualization = [
  "VirtualBox",
  "VMware",
  "Hyper-V",
  "QEMU",
  "Docker Desktop",
];

export const financeTrading = [
  "MetaTrader",
  "TradingView",
  "ThinkOrSwim",
  "Bloomberg Terminal",
  "Excel (advanced use)",
];
