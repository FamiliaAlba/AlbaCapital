import { Metric } from "@/data/metrics";

const MetricCard = ({ metric }: { metric: Metric }) => (
  <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-foreground/[0.03] to-transparent p-5 backdrop-blur-sm">
    <p className="text-minimal text-muted-foreground">{metric.label}</p>
    <p className="mt-3 text-3xl md:text-4xl font-light text-architectural">{metric.value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
  </div>
);

export default MetricCard;
