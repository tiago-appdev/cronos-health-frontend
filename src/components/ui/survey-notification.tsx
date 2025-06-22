import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { notificationApi, type SurveyReminder } from "@/services/notification-api";
import { useRouter } from "next/navigation";

export const SurveyNotification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [surveyReminders, setSurveyReminders] = useState<SurveyReminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.user_type === "patient") {
      checkSurveyReminders();
    }
  }, [user]);

  const checkSurveyReminders = async () => {
    try {
      setLoading(true);
      const reminders = await notificationApi.getSurveyReminders();
      setSurveyReminders(reminders);
    } catch (error) {
      console.error("Error fetching survey reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = (reminder: SurveyReminder) => {
    // Use the action URL from the backend or construct it
    const surveyUrl = reminder.actionUrl || `/survey?appointmentId=${reminder.appointmentId}&doctorName=${encodeURIComponent(reminder.doctorName)}&date=${encodeURIComponent(reminder.appointmentDate)}`;
    router.push(surveyUrl);
  };

  const handleDismiss = async (reminder: SurveyReminder) => {
    try {
      // Mark notification as read
      await notificationApi.markAsRead(reminder.id);
      
      // Remove from local state
      setSurveyReminders(prev => prev.filter(r => r.id !== reminder.id));
      
      toast({
        title: "Notificación marcada como leída",
        description: "Puede evaluar la cita desde su historial de citas",
        type: "info",
      });
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        type: "error",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-teal-500 bg-teal-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-teal-500 bg-teal-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">Alta</Badge>;
      case 'normal':
        return <Badge variant="secondary" className="bg-teal-100 text-teal-700">Normal</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  if (loading || surveyReminders.length === 0 || user?.user_type !== "patient") {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {surveyReminders.map((reminder) => (
        <Card key={reminder.id} className={`border-l-4 ${getPriorityColor(reminder.priority)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg text-teal-800">
                  {reminder.title}
                </CardTitle>
                {getPriorityBadge(reminder.priority)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(reminder)}
                className="text-teal-600 hover:text-teal-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-teal-700">
              {reminder.message}
            </CardDescription>
            <p className="text-xs text-teal-600">{reminder.timeAgo}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="font-medium text-teal-800">Médico:</span>
                <p className="text-teal-700">{reminder.doctorName}</p>
              </div>
              <div>
                <span className="font-medium text-teal-800">Fecha:</span>
                <p className="text-teal-700">{reminder.appointmentDate}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleTakeSurvey(reminder)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                📝 Evaluar Atención
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDismiss(reminder)}
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                Marcar como leído
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
