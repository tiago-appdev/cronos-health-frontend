import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const caracteristicas = [
    {
      title: "Calendario Inteligente",
      description:
        "Sistema que prioriza la urgencia médica y optimiza los horarios de atención.",
    },
    {
      title: "Recordatorios Automáticos",
      description:
        "Notificaciones por correo o WhatsApp para reducir ausencias y mejorar la puntualidad.",
    },
    {
      title: "Historial Clínico",
      description:
        "Acceso seguro al historial de cada paciente para un seguimiento personalizado.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
            <span className="text-xl font-bold text-teal-600">
              Cronos Health
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Gestión de Turnos Médicos Simplificada
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Cronos Health transforma la manera en que clínicas y
                consultorios organizan y optimizan la atención médica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Conocer Más
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/placeholder.svg"
                alt="Cronos Health Platform"
                className="rounded-lg shadow-lg"
                width={500}
                height={400}
              />
            </div>
          </div>
        </section>
        <section id="features" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Características Principales
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {caracteristicas.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-teal-400">
                Cronos Health
              </span>
              <p className="mt-2 text-gray-400">
                © 2025 Cronos Health. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Términos
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacidad
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
