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
    
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    onAddLab(formData);
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
      description: `${formData.name} has been added to the virtual lab collection.`
    });
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chemical Reactions Lab"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn in this lab..."
                className="resize-none"
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Chemistry"
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
                    onClick={() => setFormData({ ...formData, image: emoji })}
                    className={`p-3 text-2xl rounded-lg border-2 transition-colors hover:bg-primary/10 ${
                      formData.image === emoji ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
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