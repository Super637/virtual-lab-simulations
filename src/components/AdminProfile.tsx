import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Mail, User, BookOpen, ArrowLeft } from "lucide-react";
import adminProfile from "@/assets/admin-profile.jpg";

interface AdminProfileProps {
  labCount: number;
  onBack: () => void;
}

export const AdminProfile = ({ labCount, onBack }: AdminProfileProps) => {
  const adminData = {
    name: "Jeswin",
    role: "Lab Administrator", 
    email: "jeswin@virtuallab.edu",
    bio: "Passionate educator and researcher dedicated to making science accessible through virtual experimentation. Leading the development of interactive learning experiences.",
    joinDate: "January 2024",
    achievements: [
      "Created 15+ virtual experiments",
      "Served 1000+ students",
      "Published 3 research papers",
      "Innovation Award Winner 2024"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="hero-gradient border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-background/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Labs
            </Button>
          </div>
          
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-background">
              <AvatarImage src={adminProfile} alt={adminData.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {adminData.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{adminData.name}</h1>
                <Badge className="bg-accent text-accent-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{adminData.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-foreground">{adminData.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-foreground">{adminData.role}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </label>
                <p className="text-foreground">{adminData.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-foreground">{adminData.joinDate}</p>
              </div>
            </div>
          </Card>

          {/* Lab Statistics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Lab Management
            </h2>
            
            <div className="space-y-4">
              <div className="bg-hero-gradient p-4 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{labCount}</div>
                <div className="text-sm text-muted-foreground">Active Virtual Labs</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">1000+</div>
                  <div className="text-xs text-muted-foreground">Students Served</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-secondary">95%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {adminData.bio}
            </p>
            
            <div>
              <h3 className="font-medium mb-3">Key Achievements</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {adminData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm text-muted-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};