// pages/api/admin/actualizar-membresia.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { userId, fecha } = req.body;

  if (!userId || !fecha) {
    return res.status(400).json({ message: "Faltan parámetros" });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ fecha_membresia: fecha })
    .eq("id", userId);

  if (error) {
    console.error("Error al actualizar membresía:", error);
    return res.status(500).json({ message: "Error al actualizar membresía" });
  }

  return res.status(200).json({ message: "Membresía actualizada" });
}
