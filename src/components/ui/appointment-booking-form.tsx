"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/toast-context";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  workSchedule: string;
}

interface AppointmentBookingFormProps {
  onAppointmentBooked: () => void;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({ 
  onAppointmentBooked 
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { toast } = useToast();

  // Time slots available for appointments
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/appointments/doctors', {
          headers: {
            'x-auth-token': token || '',
          },
        });

        if (response.ok) {
          const doctorsData = await response.json();
          setDoctors(doctorsData);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los médicos disponibles",
            type: "error",
          });
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Error al cargar los médicos",
          type: "error",
        });
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify({
          doctorId: parseInt(selectedDoctor),
          appointmentDate: appointmentDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: data.message || "Cita agendada exitosamente",
          type: "success",
        });
        
        // Reset form
        setSelectedDoctor("");
        setSelectedDate(undefined);
        setSelectedTime("");
        
        // Notify parent component
        onAppointmentBooked();
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo agendar la cita",
          type: "error",
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Error al agendar la cita",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loadingDoctors) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Cargando médicos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Nueva Cita</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Seleccionar Médico</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un médico" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{doctor.name}</span>
                      <span className="text-sm text-gray-500">{doctor.specialty}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Seleccionar Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Seleccionar Hora</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una hora" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Doctor Info */}
          {selectedDoctor && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Información del Médico</h4>
              {(() => {
                const doctor = doctors.find(d => d.id.toString() === selectedDoctor);
                return doctor ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {doctor.name}</p>
                    <p><strong>Especialidad:</strong> {doctor.specialty}</p>
                    {doctor.phone && <p><strong>Teléfono:</strong> {doctor.phone}</p>}
                    {doctor.workSchedule && <p><strong>Horario:</strong> {doctor.workSchedule}</p>}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Agendando..." : "Agendar Cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};