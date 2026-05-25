import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LanguageFilterProps {
  onLanguageSelect?: (language: string) => void;
  onPopularitySelect?: (type: string) => void;
}

const languages = [
  "All Languages",
  "C++",
  "Go",
  "JavaScript",
  "PHP",
  "Python",
  "TypeScript",
];

const popularityTypes = [
  "All Popularity",
  "Most Stars",
  "Most Forks",
  "Most Issues",
  "Trending",
];

export default function LanguageFilter({
  onLanguageSelect,
  onPopularitySelect,
}: LanguageFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"languages" | "popularity">(
    "languages",
  );
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [selectedPopularity, setSelectedPopularity] =
    useState("All Popularity");

  const items = activeTab === "languages" ? languages : popularityTypes;
  const selected =
    activeTab === "languages" ? selectedLanguage : selectedPopularity;

  const handleSelect = (item: string) => {
    if (activeTab === "languages") {
      setSelectedLanguage(item);
      onLanguageSelect?.(item);
    } else {
      setSelectedPopularity(item);
      onPopularitySelect?.(item);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative w-80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-9 px-3 border border-border bg-background text-foreground text-sm hover:bg-muted transition-colors rounded-md"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 border border-border bg-background rounded-md shadow-lg overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-border bg-background">
              <button
                onClick={() => setActiveTab("languages")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "languages"
                    ? "bg-background text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Languages
              </button>
              <button
                onClick={() => setActiveTab("popularity")}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "popularity"
                    ? "bg-background text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Popularity
              </button>
            </div>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selected === item
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
