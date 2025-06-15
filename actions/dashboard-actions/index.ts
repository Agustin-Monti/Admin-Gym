"use server";

import { createClient } from "@/utils/supabase/server";



export async function contarUsuarios() {
    const supabase = await createClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function contarEjercicios() {
    const supabase = await createClient();
  const { count, error } = await supabase
    .from("ejercicios")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}

export async function contarRutinas() {
    const supabase = await createClient();
  const { count, error } = await supabase
    .from("rutinas")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count || 0;
}


export async function contarMembresiasPorEstado() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("fecha_membresia");

  if (error) throw error;

  const hoy = new Date();
  // Normalizamos la fecha para que ignore horas
  const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  let activa = 0;
  let puntoDeVencer = 0;
  let vencida = 0;

  data.forEach(({ fecha_membresia }) => {
    if (!fecha_membresia) {
      vencida++;
      return;
    }

    const inicio = new Date(fecha_membresia);
    const vencimiento = new Date(inicio);
    vencimiento.setMonth(vencimiento.getMonth() + 1);

    const vencimientoSoloFecha = new Date(
      vencimiento.getFullYear(),
      vencimiento.getMonth(),
      vencimiento.getDate()
    );

    if (vencimientoSoloFecha < hoySoloFecha) {
      vencida++;
    } else {
      const diffDias = (vencimientoSoloFecha.getTime() - hoySoloFecha.getTime()) / (1000 * 3600 * 24);
      if (diffDias <= 7) puntoDeVencer++;
      else activa++;
    }
  });

  return { activa, puntoDeVencer, vencida };
}


export async function contarUsuariosUltimosMeses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at");

  if (error) throw error;

  const hoy = new Date();
  const meses = [0, 0, 0]; // [actual, -1 mes, -2 meses]

  data.forEach(({ created_at }) => {
    const fecha = new Date(created_at);
    const diferenciaMeses =
      hoy.getMonth() - fecha.getMonth() + 12 * (hoy.getFullYear() - fecha.getFullYear());

    if (diferenciaMeses === 0) meses[0]++;
    else if (diferenciaMeses === 1) meses[1]++;
    else if (diferenciaMeses === 2) meses[2]++;
  });

  const labels = [
    new Intl.DateTimeFormat("es-AR", { month: "long" }).format(hoy),
    new Intl.DateTimeFormat("es-AR", { month: "long" }).format(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
    new Intl.DateTimeFormat("es-AR", { month: "long" }).format(new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)),
  ];

  return [
    { mes: labels[2], cantidad: meses[2] },
    { mes: labels[1], cantidad: meses[1] },
    { mes: labels[0], cantidad: meses[0] },
  ];
}



