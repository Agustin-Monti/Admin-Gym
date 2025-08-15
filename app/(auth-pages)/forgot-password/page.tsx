"use client";

import { forgotPasswordAction } from "@/actions/auth-actions/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Alert } from "@/components/Alert";

export default function ForgotPassword({
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

  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (message) setPending(false);
  }, [message]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"></div>

      <form
        className="flex flex-col mx-auto my-auto justify-center p-12 w-[95vw] sm:w-[500px] rounded-2xl bg-gray-900/90 backdrop-blur-md border-2 border-gray-800 shadow-2xl shadow-blue-900/40"
        action={forgotPasswordAction}
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-center mb-8 text-white tracking-wide">
          Recuperar Contraseña
        </h1>

        {message?.error && <Alert type="error">{message.error}</Alert>}
        {message?.success && <Alert type="success">{message.success}</Alert>}
        {message?.message && <Alert type="success">{message.message}</Alert>}

        <p className="text-lg text-gray-400 mb-6 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-blue-400 font-semibold hover:underline" href="/sign-in">
            Iniciar Sesión
          </Link>
        </p>

        <div className="flex flex-col gap-6">
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

          <SubmitButton
            className="bg-blue-500 text-white text-center mt-4 py-4 rounded-xl font-extrabold tracking-wide hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-blue-700/60 hover:shadow-blue-500/80 text-xl"
            pendingText="Enviando..."
            pending={pending}
          >
            Enviar Link
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
