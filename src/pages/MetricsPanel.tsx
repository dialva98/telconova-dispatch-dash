import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { LogOut, Shield, Download, Save, History, BarChart3 } from "lucide-react";
import MetricsFilters from "@/components/MetricsFilters";
import TechnicianMetricsTable from "@/components/TechnicianMetricsTable";
import MetricsSummaryCards from "@/components/MetricsSummaryCards";

export interface TechnicianMetrics {
  technicianId: string;
  technicianName: string;
  zone: string;
  totalOrders: number;
  completedOrders: number;
  avgResolutionTime: number; // in hours
  pendingOrders: number;
  specialty: string;
}

export interface MetricsFilters {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  zones?: string[];
}

const MetricsPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<TechnicianMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MetricsFilters>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    loadMetrics();
  }, [navigate]);

  const loadMetrics = async (appliedFilters?: MetricsFilters) => {
    setLoading(true);
    try {
      const data = await apiService.getTechnicianMetrics(appliedFilters || filters);
      setMetrics(data);
    } catch (error) {
      toast({
        title: "Error al cargar métricas",
        description: "No se pudieron cargar las métricas del sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: MetricsFilters) => {
    setFilters(newFilters);
    loadMetrics(newFilters);
  };

  const handleSaveReport = async () => {
    try {
      const reportName = `Reporte_${new Date().toISOString().split('T')[0]}`;
      await apiService.saveReport({
        name: reportName,
        filters,
        metrics,
        generatedAt: new Date().toISOString(),
      });
      toast({
        title: "Reporte guardado",
        description: `El reporte "${reportName}" se ha guardado exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el reporte.",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = () => {
    const csvContent = generateCSV(metrics);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `metricas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Reporte exportado",
      description: "El archivo CSV se ha descargado exitosamente.",
    });
  };

  const generateCSV = (data: TechnicianMetrics[]): string => {
    const headers = ['ID Técnico', 'Nombre', 'Zona', 'Total Órdenes', 'Completadas', 'Tiempo Promedio (hrs)', 'Pendientes', 'Especialidad'];
    const rows = data.map(m => [
      m.technicianId,
      m.technicianName,
      m.zone,
      m.totalOrders,
      m.completedOrders,
      m.avgResolutionTime.toFixed(2),
      m.pendingOrders,
      m.specialty
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem('user');
    navigate('/');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">TelcoNova - Panel de Métricas</h1>
            <p className="text-sm text-muted-foreground">Sistema de Control y Reportes</p>
          </div>
          <nav className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            {user?.role === 'admin' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Panel Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <MetricsSummaryCards metrics={metrics} />

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>
              Filtra las métricas por rango de fechas, tipo de servicio y zonas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricsFilters onFilterChange={handleFilterChange} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button onClick={handleSaveReport} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Reporte
          </Button>
          <Button onClick={handleExportReport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => navigate('/reports-history')} 
            variant="outline" 
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Ver Reportes Históricos
          </Button>
        </div>

        {/* Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas por Técnico</CardTitle>
            <CardDescription>
              Resumen detallado del desempeño de cada técnico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TechnicianMetricsTable metrics={metrics} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MetricsPanel;
