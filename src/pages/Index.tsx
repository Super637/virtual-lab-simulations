import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LabCard, Lab } from "@/components/LabCard";
import { AddLabModal } from "@/components/AddLabModal";
import { AdminProfile } from "@/components/AdminProfile";
import { FloatingElements } from "@/components/FloatingElements";
import { Crown, User, GraduationCap } from "lucide-react";
import { ErrorBoundary } from "@/utils/errorBoundary";
import { isValidUrl } from "@/utils/safetyHelpers";
import adminProfile from "@/assets/admin-profile.jpg";

const Index = () => {
  const [currentView, setCurrentView] = useState<"labs" | "profile">("labs");
  const [labs, setLabs] = useState<Lab[]>([
    {
      id: "1",
      name: "Chemical Reactions Lab",
      description: "Explore acids, bases, and chemical bonds through interactive experiments. Learn reaction mechanisms and molecular interactions.",
      image: "🧪",
      category: "Chemistry",
      difficulty: "Intermediate"
    },
    {
      id: "2", 
      name: "Physics Mechanics Lab",
      description: "Discover the laws of motion, gravity, and energy through virtual simulations. Perfect for understanding fundamental physics concepts.",
      image: "⚛️",
      category: "Physics", 
      difficulty: "Beginner"
    },
    {
      id: "3",
      name: "Microscopy & Cell Biology",
      description: "Examine cellular structures and biological processes using virtual microscopes and advanced imaging techniques.",
      image: "🔬",
      category: "Biology",
      difficulty: "Advanced"
    },
    {
      id: "4",
      name: "Astronomy Observatory", 
      description: "Journey through space to explore planets, stars, and galaxies using our virtual telescope system.",
      image: "🔭",
      category: "Astronomy",
      difficulty: "Intermediate"
    },
    {
      id: "5",
      name: "Genetics & DNA Analysis",
      description: "Unlock the secrets of heredity and genetic engineering through interactive DNA manipulation tools.",
      image: "🧬", 
      category: "Genetics",
      difficulty: "Advanced"
    },
    {
      id: "6",
      name: "Environmental Science Hub",
      description: "Study ecosystems, climate change, and environmental impact through real-world data simulations.",
      image: "🌱",
      category: "Environmental Science",
      difficulty: "Beginner",
      isComingSoon: true
    }
  ]);

  const handleAddLab = (newLab: Omit<Lab, "id">) => {
    try {
      // Validate required fields
      if (!newLab.name?.trim() || !newLab.description?.trim() || !newLab.category?.trim()) {
        console.error("Invalid lab data - missing required fields:", newLab);
        return;
      }

      const lab: Lab = {
        ...newLab,
        id: Date.now().toString(),
        // Sanitize inputs
        name: newLab.name.trim(),
        description: newLab.description.trim(),
        category: newLab.category.trim(),
        difficulty: newLab.difficulty || "Beginner"
      };
      
      setLabs(prevLabs => {
        if (!Array.isArray(prevLabs)) {
          console.error("Labs state is not an array, resetting");
          return [lab];
        }
        return [...prevLabs, lab];
      });
    } catch (error) {
      console.error("Error adding lab:", error);
    }
  };

  const handleLabSelect = (lab: Lab) => {
    try {
      // Validate lab object
      if (!lab || !lab.category || !lab.name) {
        console.error("Invalid lab object:", lab);
        return;
      }

      // Map Chemistry and Physics to external URLs
      if (lab.category === "Chemistry") {
        const url = "https://jes-win-hac-ker.github.io/browser-lab-experiments/";
        if (!isValidUrl(url)) {
          console.error("Invalid Chemistry lab URL");
          return;
        }
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          console.error("Failed to open Chemistry lab - popup blocked?");
          // Fallback: try to navigate in same window
          window.location.href = url;
        }
        return;
      }
      
      if (lab.category === "Physics") {
        const url = "https://jes-win-hac-ker.github.io/interactive-physics-lab/";
        if (!isValidUrl(url)) {
          console.error("Invalid Physics lab URL");
          return;
        }
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          console.error("Failed to open Physics lab - popup blocked?");
          // Fallback: try to navigate in same window
          window.location.href = url;
        }
        return;
      }
      
      // Default: just log
      console.log("Selected lab:", lab.name);
    } catch (error) {
      console.error("Error selecting lab:", error);
    }
  };

  if (currentView === "profile") {
    const labCount = Array.isArray(labs) ? labs.length : 0;
    return (
      <ErrorBoundary>
        <AdminProfile labCount={labCount} onBack={() => setCurrentView("labs")} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />
      
      {/* Header */}
      <header className="relative z-10 hero-gradient border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 slide-up">
              🎓 Virtual Science Lab
            </h1>
            <p className="text-xl text-muted-foreground slide-up-delayed">
              Select a lab to start experimenting
            </p>
          </div>

          {/* Admin Section */}
          <div className="flex items-center justify-between max-w-4xl mx-auto slide-up-delayed-2">
            <div className="flex items-center gap-4">
              <Avatar 
                className="w-12 h-12 border-2 border-background cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setCurrentView("profile")}
              >
                <AvatarImage src={adminProfile} alt="Jeswin" />
                <AvatarFallback className="bg-primary text-primary-foreground">J</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setCurrentView("profile")}
                  >
                    Jeswin
                  </span>
                  <Badge className="bg-accent text-accent-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Lab Administrator</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView("profile")}
                className="hover:bg-background/10"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <AddLabModal onAddLab={handleAddLab} />
            </div>
          </div>
        </div>
      </header>

      {/* Lab Grid */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Available Laboratories</h2>
          </div>
          <p className="text-muted-foreground">Choose from our collection of interactive virtual labs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Array.isArray(labs) && labs.length > 0 ? (
            labs.map((lab, index) => (
              <LabCard
                key={lab?.id || `lab-${index}`}
                lab={lab}
                index={index}
                onSelect={handleLabSelect}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No labs available. Click "Add New Lab" to get started.</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="slide-up">
              <div className="text-3xl font-bold text-primary mb-2">
                {Array.isArray(labs) ? labs.filter(l => l && !l.isComingSoon).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Labs</div>
            </div>
            <div className="slide-up-delayed">
              <div className="text-3xl font-bold text-secondary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Students Served</div>
            </div>
            <div className="slide-up-delayed-2">
              <div className="text-3xl font-bold text-accent mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default Index;