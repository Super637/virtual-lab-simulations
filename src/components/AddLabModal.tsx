import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Beaker } from "lucide-react";
import { Lab } from "./LabCard";
import { useToast } from "@/hooks/use-toast";

interface AddLabModalProps {
  onAddLab: (lab: Omit<Lab, "id">) => void;
}

export const AddLabModal = ({ onAddLab }: AddLabModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "🧪",
    category: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced"
  });
  const { toast } = useToast();

  const scienceEmojis = ["🧪", "🔬", "⚗️", "🧬", "🔭", "⚛️", "🌡️", "🧲", "💡", "🚀"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const name = formData.name?.trim();
      const description = formData.description?.trim();
      const category = formData.category?.trim();

      if (!name || !description || !category) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Validate field lengths
      if (name.length > 100) {
        toast({
          title: "Name Too Long",
          description: "Lab name must be 100 characters or less.",
          variant: "destructive"
        });
        return;
      }

      if (description.length > 500) {
        toast({
          title: "Description Too Long",
          description: "Lab description must be 500 characters or less.",
          variant: "destructive"
        });
        return;
      }

      const sanitizedData = {
        name: name,
        description: description,
        image: formData.image || "🧪",
        category: category,
        difficulty: formData.difficulty || "Beginner" as "Beginner" | "Intermediate" | "Advanced"
      };

      if (typeof onAddLab === 'function') {
        onAddLab(sanitizedData);
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          image: "🧪",
          category: "",
          difficulty: "Beginner"
        });
        
        toast({
          title: "Lab Added Successfully!",
          description: `${sanitizedData.name} has been added to the virtual lab collection.`
        });
      } else {
        throw new Error("onAddLab function not provided");
      }
    } catch (error) {
      console.error("Error adding lab:", error);
      toast({
        title: "Error",
        description: "Failed to add lab. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          Add New Lab
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Create New Virtual Lab
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Lab Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setFormData({ ...formData, name: value });
                  }
                }}
                placeholder="e.g., Chemical Reactions Lab"
                maxLength={100}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setFormData({ ...formData, description: value });
                  }
                }}
                placeholder="Describe what students will learn in this lab..."
                className="resize-none"
                maxLength={500}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setFormData({ ...formData, category: value });
                    }
                  }}
                  placeholder="e.g., Chemistry"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") => 
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Lab Icon</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {scienceEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      try {
                        setFormData({ ...formData, image: emoji });
                      } catch (error) {
                        console.error("Error setting emoji:", error);
                      }
                    }}
                    className={`p-3 text-2xl rounded-lg border-2 transition-colors hover:bg-primary/10 ${
                      formData.image === emoji ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    aria-label={`Select ${emoji} as lab icon`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1">
              Create Lab
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};