import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Lab {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  isComingSoon?: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface LabCardProps {
  lab: Lab;
  index: number;
  onSelect: (lab: Lab) => void;
}

export const LabCard = ({ lab, index, onSelect }: LabCardProps) => {
  // Validate props
  if (!lab) {
    console.error("LabCard received invalid lab prop");
    return null;
  }

  const safeIndex = typeof index === 'number' ? index : 0;
  const delayClass = safeIndex % 3 === 0 ? "slide-up" : safeIndex % 3 === 1 ? "slide-up-delayed" : "slide-up-delayed-2";
  
  const difficultyColors = {
    Beginner: "bg-accent text-accent-foreground",
    Intermediate: "bg-primary text-primary-foreground", 
    Advanced: "bg-secondary text-secondary-foreground"
  };

  const handleClick = () => {
    try {
      if (lab.isComingSoon) return;
      if (typeof onSelect === 'function') {
        onSelect(lab);
      } else {
        console.error("onSelect is not a function");
      }
    } catch (error) {
      console.error("Error handling lab card click:", error);
    }
  };

  return (
    <Card 
      className={`lab-card ${delayClass} ${lab.isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={handleClick}
    >
      <div className="relative p-6">
        {lab.isComingSoon && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Coming Soon
            </Badge>
          </div>
        )}
        
        <div className="mb-4">
          <div className="w-full h-32 rounded-lg hero-gradient flex items-center justify-center text-6xl mb-4">
            {lab.image || "🧪"}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">
              {lab.name || "Untitled Lab"}
            </h3>
            <Badge className={difficultyColors[lab.difficulty] || difficultyColors.Beginner}>
              {lab.difficulty || "Beginner"}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            {lab.description || "No description available"}
          </p>
          
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {lab.category || "General"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};