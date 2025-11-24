import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TechnicianMetrics } from "@/pages/MetricsPanel";

interface TechnicianMetricsTableProps {
  metrics: TechnicianMetrics[];
}

const TechnicianMetricsTable = ({ metrics }: TechnicianMetricsTableProps) => {
  const getEfficiencyBadge = (avgTime: number) => {
    if (avgTime < 4) return <Badge className="bg-success">Excelente</Badge>;
    if (avgTime < 8) return <Badge className="bg-primary">Bueno</Badge>;
    if (avgTime < 12) return <Badge className="bg-warning">Regular</Badge>;
    return <Badge variant="destructive">Necesita Mejora</Badge>;
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return ((completed / total) * 100).toFixed(1);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Zona</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead className="text-center">Total Órdenes</TableHead>
            <TableHead className="text-center">Completadas</TableHead>
            <TableHead className="text-center">Pendientes</TableHead>
            <TableHead className="text-center">% Completadas</TableHead>
            <TableHead className="text-center">Tiempo Prom. (hrs)</TableHead>
            <TableHead className="text-center">Eficiencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          ) : (
            metrics.map((metric) => (
              <TableRow key={metric.technicianId}>
                <TableCell className="font-medium">{metric.technicianId}</TableCell>
                <TableCell>{metric.technicianName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{metric.zone}</Badge>
                </TableCell>
                <TableCell>{metric.specialty}</TableCell>
                <TableCell className="text-center">{metric.totalOrders}</TableCell>
                <TableCell className="text-center">{metric.completedOrders}</TableCell>
                <TableCell className="text-center">{metric.pendingOrders}</TableCell>
                <TableCell className="text-center font-semibold">
                  {getCompletionRate(metric.completedOrders, metric.totalOrders)}%
                </TableCell>
                <TableCell className="text-center">
                  {metric.avgResolutionTime.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {getEfficiencyBadge(metric.avgResolutionTime)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TechnicianMetricsTable;
