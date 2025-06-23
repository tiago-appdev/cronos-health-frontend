"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft, Search, Clock } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-600"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-2xl font-bold text-teal-600">
              Cronos Health
            </span>
          </Link>
        </div>

        {/* Main 404 Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-6 relative">
              {/* 404 Number with medical cross */}
              <div className="text-8xl font-bold text-teal-100 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-teal-600 text-white p-3 rounded-full">
                  <Search className="h-8 w-8" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              ¡Oops! Página no encontrada
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              La página que estás buscando no existe o ha sido movida.
              <br />
              No te preocupes, te ayudamos a encontrar el camino de vuelta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto redirect notice */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-teal-700">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Redirigiendo automáticamente en {countdown} segundos...
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGoBack}
                size="lg"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al Dashboard</span>
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Ir al Inicio</span>
              </Button>
            </div>

            {/* Helpful suggestions */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                ¿Qué puedes hacer?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-600"
                    >
                      <path d="M9 11l3 3l8-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Revisar tus turnos
                    </p>
                    <p className="text-sm text-gray-500">
                      Ve tus citas médicas programadas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-600"
                    >
                      <path d="M9 11l3 3l8-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Ver historial médico
                    </p>
                    <p className="text-sm text-gray-500">
                      Consulta tu información médica
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-600"
                    >
                      <path d="M9 11l3 3l8-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Contactar soporte
                    </p>
                    <p className="text-sm text-gray-500">
                      Si necesitas ayuda adicional
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-600"
                    >
                      <path d="M9 11l3 3l8-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Agendar nueva cita
                    </p>
                    <p className="text-sm text-gray-500">
                      Programa tu próxima consulta
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                ¿Necesitas ayuda? Contáctanos en{" "}
                <a
                  href="mailto:soporte@cronoshealth.com"
                  className="text-teal-600 hover:underline"
                >
                  soporte@cronoshealth.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Cronos Health. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
