import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Clapperboard, Palette, PenTool } from "lucide-react";

const services = [
  {
    icon: <Clapperboard className="w-10 h-10 text-accent" />,
    title: "Video Production",
    description: "Full-service video production from concept to final cut.",
  },
  {
    icon: <Camera className="w-10 h-10 text-accent" />,
    title: "Photography",
    description: "Professional photography for events, products, and portraits.",
  },
  {
    icon: <Palette className="w-10 h-10 text-accent" />,
    title: "Branding & Design",
    description: "Crafting unique brand identities and stunning visual designs.",
  },
  {
    icon: <PenTool className="w-10 h-10 text-accent" />,
    title: "Motion Graphics",
    description: "Engaging 2D and 3D animations that bring your ideas to life.",
  },
];

export function Services() {
  return (
    <section id="services" className="container py-20 md:py-32 bg-background">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">Our Services</h2>
        <p className="mt-4 text-lg text-foreground/80">
          We offer a comprehensive range of media production services.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <Card key={index} className="bg-card border-border/60 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10">
            <CardHeader className="items-center text-center p-8">
              <div className="p-4 bg-background rounded-full mb-4">
                {service.icon}
              </div>
              <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
              <CardDescription className="pt-2">{service.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
