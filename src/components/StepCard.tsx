import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const StepCard = ({ number, title, description, icon: Icon }: StepCardProps) => (
  <div className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-6 md:p-8">
    <div className="flex items-start justify-between">
      <span className="text-minimal text-muted-foreground">{number}</span>
      <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <h4 className="mt-6 text-xl font-light text-architectural">{title}</h4>
    <div className="mt-3 h-px w-10 bg-foreground/30" />
    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default StepCard;
