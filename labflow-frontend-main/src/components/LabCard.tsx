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
  const delayClass = index % 3 === 0 ? "slide-up" : index % 3 === 1 ? "slide-up-delayed" : "slide-up-delayed-2";
  
  const difficultyColors = {
    Beginner: "bg-accent text-accent-foreground",
    Intermediate: "bg-primary text-primary-foreground", 
    Advanced: "bg-secondary text-secondary-foreground"
  };

  return (
    <Card 
      className={`lab-card ${delayClass} ${lab.isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={() => !lab.isComingSoon && onSelect(lab)}
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
            {lab.image}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">{lab.name}</h3>
            <Badge className={difficultyColors[lab.difficulty]}>
              {lab.difficulty}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            {lab.description}
          </p>
          
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {lab.category}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};