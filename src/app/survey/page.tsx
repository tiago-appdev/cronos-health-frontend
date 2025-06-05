"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
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
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">
            Encuesta de Satisfacción
          </CardTitle>
          <CardDescription className="text-center">
            Su opinión nos ayuda a mejorar nuestros servicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      1. ¿Cómo calificaría la facilidad para agendar su cita?
                    </h3>
                    <RadioGroup defaultValue="4">
                      <div className="flex justify-between max-w-md">
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="1" id="r1" />
                          <Label htmlFor="r1" className="mt-1">
                            1
                          </Label>
                          <span className="text-xs text-gray-500">
                            Muy difícil
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="2" id="r2" />
                          <Label htmlFor="r2" className="mt-1">
                            2
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="3" id="r3" />
                          <Label htmlFor="r3" className="mt-1">
                            3
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="4" id="r4" />
                          <Label htmlFor="r4" className="mt-1">
                            4
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="5" id="r5" />
                          <Label htmlFor="r5" className="mt-1">
                            5
                          </Label>
                          <span className="text-xs text-gray-500">
                            Muy fácil
                          </span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      2. ¿Cómo calificaría la puntualidad de su atención?
                    </h3>
                    <RadioGroup defaultValue="3">
                      <div className="flex justify-between max-w-md">
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="1" id="p1" />
                          <Label htmlFor="p1" className="mt-1">
                            1
                          </Label>
                          <span className="text-xs text-gray-500">
                            Muy mala
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="2" id="p2" />
                          <Label htmlFor="p2" className="mt-1">
                            2
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="3" id="p3" />
                          <Label htmlFor="p3" className="mt-1">
                            3
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="4" id="p4" />
                          <Label htmlFor="p4" className="mt-1">
                            4
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="5" id="p5" />
                          <Label htmlFor="p5" className="mt-1">
                            5
                          </Label>
                          <span className="text-xs text-gray-500">
                            Excelente
                          </span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      3. ¿Cómo calificaría la atención del personal médico?
                    </h3>
                    <RadioGroup defaultValue="5">
                      <div className="flex justify-between max-w-md">
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="1" id="m1" />
                          <Label htmlFor="m1" className="mt-1">
                            1
                          </Label>
                          <span className="text-xs text-gray-500">
                            Muy mala
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="2" id="m2" />
                          <Label htmlFor="m2" className="mt-1">
                            2
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="3" id="m3" />
                          <Label htmlFor="m3" className="mt-1">
                            3
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="4" id="m4" />
                          <Label htmlFor="m4" className="mt-1">
                            4
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="5" id="m5" />
                          <Label htmlFor="m5" className="mt-1">
                            5
                          </Label>
                          <span className="text-xs text-gray-500">
                            Excelente
                          </span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      4. ¿Cómo calificaría la plataforma de Cronos Health?
                    </h3>
                    <RadioGroup defaultValue="4">
                      <div className="flex justify-between max-w-md">
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="1" id="c1" />
                          <Label htmlFor="c1" className="mt-1">
                            1
                          </Label>
                          <span className="text-xs text-gray-500">
                            Muy mala
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="2" id="c2" />
                          <Label htmlFor="c2" className="mt-1">
                            2
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="3" id="c3" />
                          <Label htmlFor="c3" className="mt-1">
                            3
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="4" id="c4" />
                          <Label htmlFor="c4" className="mt-1">
                            4
                          </Label>
                        </div>
                        <div className="flex flex-col items-center">
                          <RadioGroupItem value="5" id="c5" />
                          <Label htmlFor="c5" className="mt-1">
                            5
                          </Label>
                          <span className="text-xs text-gray-500">
                            Excelente
                          </span>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      5. ¿Recomendaría nuestros servicios a otras personas?
                    </h3>
                    <RadioGroup defaultValue="yes">
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">No</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="maybe" id="maybe" />
                          <Label htmlFor="maybe">Tal vez</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      6. Comentarios adicionales o sugerencias
                    </h3>
                    <Textarea
                      placeholder="Escriba sus comentarios aquí..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Anterior
                  </Button>
                )}
                {step < 2 ? (
                  <Button
                    type="button"
                    className="ml-auto"
                    onClick={handleNext}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto">
                    Enviar
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                ¡Gracias por su opinión!
              </h3>
              <p className="text-gray-500 mb-6">
                Sus comentarios son muy valiosos para nosotros y nos ayudarán a
                mejorar nuestros servicios.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Volver al Dashboard
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-gray-500">
            Cronos Health © 2025. Todos los derechos reservados.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
