"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-context";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "sent" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Simulate API call to request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStep("sent");
      startCountdown();

      toast({
        title: "Correo enviado",
        description: "Hemos enviado las instrucciones a tu correo electrónico",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el correo. Inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulate API call to reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Contraseña restablecida",
        description: "Tu contraseña ha sido actualizada correctamente",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Código inválido o expirado. Inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Start countdown for resend button
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend email
  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      startCountdown();
      toast({
        title: "Correo reenviado",
        description: "Hemos enviado nuevamente las instrucciones",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reenviar el correo",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
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

        <Card className="shadow-xl border-0">
          {/* Step 1: Email Input */}
          {step === "email" && (
            <>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 bg-teal-100 p-3 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  ¿Olvidaste tu contraseña?
                </CardTitle>
                <CardDescription className="text-gray-600">
                  No te preocupes, te ayudamos a recuperarla.
                  <br />
                  Ingresa tu correo electrónico y te enviaremos las
                  instrucciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Instrucciones
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Link
                  href="/login"
                  className="flex items-center text-sm text-teal-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </CardFooter>
            </>
          )}

          {/* Step 2: Email Sent Confirmation */}
          {step === "sent" && (
            <>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 bg-green-100 p-3 rounded-full w-fit">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  ¡Correo enviado!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Hemos enviado las instrucciones para restablecer tu contraseña
                  a:
                  <br />
                  <span className="font-medium text-gray-800">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Revisa tu bandeja de entrada y la carpeta de spam. El correo
                    puede tardar unos minutos en llegar.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Button onClick={() => setStep("reset")} className="w-full">
                    Ya tengo el código
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={countdown > 0 || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Reenviar en {countdown}s
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Reenviar correo
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Link
                  href="/login"
                  className="flex items-center text-sm text-teal-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </CardFooter>
            </>
          )}

          {/* Step 3: Reset Password Form */}
          {step === "reset" && (
            <>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 bg-blue-100 p-3 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Restablecer Contraseña
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ingresa el código que recibiste por correo y tu nueva
                  contraseña.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetCode">Código de Verificación</Label>
                    <Input
                      id="resetCode"
                      type="text"
                      placeholder="Ingresa el código de 6 dígitos"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                      disabled={loading}
                    />
                  </div>

                  {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Las contraseñas no coinciden
                        </AlertDescription>
                      </Alert>
                    )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Restableciendo...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Restablecer Contraseña
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <button
                  onClick={() => setStep("sent")}
                  className="flex items-center text-sm text-teal-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver atrás
                </button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda? Contáctanos en{" "}
            <a
              href="mailto:soporte@cronoshealth.com"
              className="text-teal-600 hover:underline"
            >
              soporte@cronoshealth.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
