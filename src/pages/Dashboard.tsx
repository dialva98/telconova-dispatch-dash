import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiService, WorkOrder, Technician } from "@/lib/api";
import { 
  Users, 
  ClipboardList, 
  LogOut, 
  UserCog, 
  Zap,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import ManualAssignment from "@/components/ManualAssignment";
import AutomaticAssignment from "@/components/AutomaticAssignment";
import WorkOrdersList from "@/components/WorkOrdersList";
import TechniciansList from "@/components/TechniciansList";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    availableTechnicians: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const [ordersData, techniciansData] = await Promise.all([
        apiService.getWorkOrders(),
        apiService.getTechnicians(),
      ]);

      setWorkOrders(ordersData);
      setTechnicians(techniciansData);

      setStats({
        pending: ordersData.filter(o => o.status === 'pending').length,
        assigned: ordersData.filter(o => o.status === 'assigned').length,
        inProgress: ordersData.filter(o => o.status === 'in_progress').length,
        completed: ordersData.filter(o => o.status === 'completed').length,
        availableTechnicians: techniciansData.filter(t => t.availability === 'available').length,
      });
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los datos del dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
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
            <h1 className="text-2xl font-bold text-primary">TelcoNova</h1>
            <p className="text-sm text-muted-foreground">Sistema de Asignación de Técnicos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Órdenes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-warning">{stats.pending}</span>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Asignadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">{stats.assigned}</span>
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-accent">{stats.inProgress}</span>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-success">{stats.completed}</span>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Técnicos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-success">{stats.availableTechnicians}</span>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Órdenes
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <UserCog className="h-4 w-4" />
              Asignación Manual
            </TabsTrigger>
            <TabsTrigger value="automatic" className="gap-2">
              <Zap className="h-4 w-4" />
              Asignación Automática
            </TabsTrigger>
            <TabsTrigger value="technicians" className="gap-2">
              <Users className="h-4 w-4" />
              Técnicos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <WorkOrdersList orders={workOrders} onRefresh={loadDashboardData} />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <ManualAssignment 
              orders={workOrders.filter(o => o.status === 'pending')}
              technicians={technicians}
              onAssignment={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="automatic" className="space-y-4">
            <AutomaticAssignment 
              orders={workOrders.filter(o => o.status === 'pending')}
              onAssignment={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="technicians" className="space-y-4">
            <TechniciansList technicians={technicians} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
