import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Technician } from "@/lib/api";
import { MapPin, Award, Phone, Mail, Activity } from "lucide-react";

interface TechniciansListProps {
  technicians: Technician[];
}

const TechniciansList = ({ technicians }: TechniciansListProps) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      busy: 'Ocupado',
      offline: 'No disponible'
    };
    return labels[availability] || availability;
  };

  const getLoadColor = (load: number) => {
    if (load === 0) return 'text-success';
    if (load <= 2) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Técnicos</CardTitle>
        <CardDescription>
          Lista de todos los técnicos registrados ({technicians.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {technicians.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay técnicos registrados
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="p-4 border rounded-lg hover:shadow-soft transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{tech.name}</h3>
                    <Badge className={getAvailabilityColor(tech.availability)}>
                      {getAvailabilityLabel(tech.availability)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getLoadColor(tech.currentLoad)}`}>
                      {tech.currentLoad}
                    </p>
                    <p className="text-xs text-muted-foreground">órdenes</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {tech.email}
                  </p>
                  <p className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {tech.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{tech.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{tech.zone}</span>
                  </div>
                </div>

                {tech.certifications && tech.certifications.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Certificaciones
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tech.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechniciansList;
