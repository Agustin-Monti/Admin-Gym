"use client";

import { signInAction } from "@/actions/auth-actions/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert } from "@/components/Alert";

export default function Login({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) {
  const message: any = searchParams.success
    ? { success: String(searchParams.success) }
    : searchParams.error
    ? { error: String(searchParams.error) }
    : searchParams.message
    ? { message: String(searchParams.message) }
    : null;

  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (message) setPending(false);
  }, [message]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black relative">
      {/* Fondo con textura */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"></div>

      <form
        className="flex flex-col mx-auto my-auto justify-center p-12 w-[95vw] sm:w-[500px] rounded-2xl bg-gray-900/90 backdrop-blur-md border-2 border-gray-800 shadow-2xl shadow-blue-900/40"
        action={signInAction}
      >
        {/* Título */}
        <h1 className="w-full text-5xl sm:text-6xl font-extrabold text-center mb-8 text-white tracking-wide">
          Iniciar Sesión
        </h1>

        {/* Alertas */}
        {message?.error && <Alert type="error">{message.error}</Alert>}
        {message?.success && <Alert type="success">{message.success}</Alert>}
        {message?.message && <Alert type="success">{message.message}</Alert>}

        

        <div className="flex flex-col gap-6">
          {/* Email */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="email" className="text-lg font-medium text-gray-300">
              Email
            </Label>
            <Input
              className="mt-1 block w-full rounded-lg border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500/50 py-4 px-4 text-lg"
              name="email"
              placeholder="correo@correo.com"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-lg font-medium text-gray-300">
              Contraseña
            </Label>
            <Link
              className="text-sm text-blue-400 hover:underline"
              href="/forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="flex flex-col gap-3 relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Tu contraseña"
              required
              className="mt-1 block w-full rounded-lg border-2 border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500/50 pr-12 py-4 text-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[50%] translate-y-[-50%] text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          {/* Botón */}
          <SubmitButton
            className="bg-blue-500 text-white text-center mt-6 py-4 rounded-xl font-extrabold tracking-wide hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-blue-700/60 hover:shadow-blue-500/80 text-xl"
            pendingText="Accediendo..."
            pending={pending}
          >
            Iniciar Sesión
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
