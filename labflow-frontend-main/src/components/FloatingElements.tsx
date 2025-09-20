import { Atom, Dna, Microscope, Zap, Beaker, Telescope } from "lucide-react";

export const FloatingElements = () => {
  const elements = [
    { icon: Atom, className: "float-animation top-20 left-[10%] text-primary/30" },
    { icon: Dna, className: "float-delayed top-32 right-[15%] text-secondary/30" },
    { icon: Microscope, className: "float-delayed-2 top-40 left-[20%] text-accent/30" },
    { icon: Zap, className: "float-animation top-60 right-[25%] text-primary/20" },
    { icon: Beaker, className: "float-delayed top-[70%] left-[5%] text-secondary/20" },
    { icon: Telescope, className: "float-delayed-2 top-[80%] right-[10%] text-accent/25" }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map(({ icon: Icon, className }, index) => (
        <Icon
          key={index}
          className={`absolute w-8 h-8 ${className}`}
        />
      ))}
    </div>
  );
};