import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricsFilters as FiltersType } from "@/pages/MetricsPanel";
import { Filter, X } from "lucide-react";

interface MetricsFiltersProps {
  onFilterChange: (filters: FiltersType) => void;
}

const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];
const SERVICE_TYPES = [
  'Instalación',
  'Reparación',
  'Mantenimiento',
  'Configuración',
  'Soporte Técnico'
];

const MetricsFilters = ({ onFilterChange }: MetricsFiltersProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const handleZoneToggle = (zone: string) => {
    setSelectedZones(prev =>
      prev.includes(zone)
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const handleApplyFilters = () => {
    const filters: FiltersType = {};
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (serviceType) filters.serviceType = serviceType;
    if (selectedZones.length > 0) filters.zones = selectedZones;

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setServiceType('');
    setSelectedZones([]);
    onFilterChange({});
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha Inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha Fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="serviceType">Tipo de Servicio</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger id="serviceType">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-2">
        <Label>Zonas</Label>
        <div className="flex flex-wrap gap-4">
          {ZONES.map(zone => (
            <div key={zone} className="flex items-center space-x-2">
              <Checkbox
                id={`zone-${zone}`}
                checked={selectedZones.includes(zone)}
                onCheckedChange={() => handleZoneToggle(zone)}
              />
              <label
                htmlFor={`zone-${zone}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {zone}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleApplyFilters} className="gap-2">
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </Button>
        <Button onClick={handleClearFilters} variant="outline" className="gap-2">
          <X className="h-4 w-4" />
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};

export default MetricsFilters;
