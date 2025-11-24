import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiService, SavedReport } from "@/lib/api";
import { LogOut, Shield, BarChart3, Download, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ReportsHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    loadReports();
  }, [navigate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSavedReports();
      setReports(data);
    } catch (error) {
      toast({
        title: "Error al cargar reportes",
        description: "No se pudieron cargar los reportes guardados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await apiService.getReportById(reportId);
      // Store in sessionStorage for viewing
      sessionStorage.setItem('viewingReport', JSON.stringify(report));
      navigate('/metrics?view=report');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (reportId: string, reportName: string) => {
    try {
      const report = await apiService.getReportById(reportId);
      const csvContent = generateCSV(report.metrics);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Reporte descargado",
        description: "El archivo CSV se ha descargado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte.",
        variant: "destructive",
      });
    }
  };

  const generateCSV = (metrics: any[]): string => {
    const headers = ['ID Técnico', 'Nombre', 'Zona', 'Total Órdenes', 'Completadas', 'Tiempo Promedio (hrs)', 'Pendientes', 'Especialidad'];
    const rows = metrics.map(m => [
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

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      await apiService.deleteReport(reportToDelete);
      setReports(reports.filter(r => r.id !== reportToDelete));
      toast({
        title: "Reporte eliminado",
        description: "El reporte se ha eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando reportes...</p>
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
            <h1 className="text-2xl font-bold text-primary">TelcoNova - Reportes Históricos</h1>
            <p className="text-sm text-muted-foreground">Consulta y gestiona reportes guardados</p>
          </div>
          <nav className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/metrics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Panel Métricas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
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
        <Card>
          <CardHeader>
            <CardTitle>Reportes Guardados</CardTitle>
            <CardDescription>
              {reports.length} reporte{reports.length !== 1 ? 's' : ''} disponible{reports.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No hay reportes guardados</p>
                <Button onClick={() => navigate('/metrics')}>
                  Crear Nuevo Reporte
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Reporte</TableHead>
                    <TableHead>Fecha de Generación</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Técnicos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{formatDate(report.generatedAt)}</TableCell>
                      <TableCell>
                        {report.filters.startDate && report.filters.endDate
                          ? `${new Date(report.filters.startDate).toLocaleDateString('es-ES')} - ${new Date(report.filters.endDate).toLocaleDateString('es-ES')}`
                          : 'Todos los períodos'}
                      </TableCell>
                      <TableCell>{report.metrics.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id, report.name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(report.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportsHistory;
