import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { TechnicianMetrics } from "@/pages/MetricsPanel";

interface MetricsSummaryCardsProps {
  metrics: TechnicianMetrics[];
}

const MetricsSummaryCards = ({ metrics }: MetricsSummaryCardsProps) => {
  const totalTechnicians = metrics.length;
  const totalOrders = metrics.reduce((sum, m) => sum + m.totalOrders, 0);
  const totalCompleted = metrics.reduce((sum, m) => sum + m.completedOrders, 0);
  const avgResolutionTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.avgResolutionTime, 0) / metrics.length
    : 0;
  const completionRate = totalOrders > 0 ? ((totalCompleted / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-primary">{totalTechnicians}</span>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Órdenes Totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-accent">{totalOrders}</span>
            <TrendingUp className="h-8 w-8 text-accent" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tasa de Completado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-success">{completionRate.toFixed(1)}%</span>
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tiempo Prom. Resolución
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{avgResolutionTime.toFixed(1)}h</span>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsSummaryCards;
