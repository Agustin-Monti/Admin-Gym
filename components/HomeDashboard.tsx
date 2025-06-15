"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  contarUsuarios,
  contarEjercicios,
  contarRutinas,
  contarMembresiasPorEstado,
  contarUsuariosUltimosMeses,
} from "@/actions/dashboard-actions";

const COLORS = ["#4ade80", "#facc15", "#ef4444"]; // verde, amarillo, rojo

export default function HomeDashboard() {
  const [usuarios, setUsuarios] = useState(0);
  const [ejercicios, setEjercicios] = useState(0);
  const [rutinas, setRutinas] = useState(0);
  const [membresiasEstado, setMembresiasEstado] = useState({
    activa: 0,
    puntoDeVencer: 0,
    vencida: 0,
  });
  const [usuariosPorMes, setUsuariosPorMes] = useState<
    { mes: string; cantidad: number }[]
  >([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchDatos() {
      setCargando(true);
      try {
        const [
          usuariosCount,
          ejerciciosCount,
          rutinasCount,
          membresias,
          usuariosMes,
        ] = await Promise.all([
          contarUsuarios(),
          contarEjercicios(),
          contarRutinas(),
          contarMembresiasPorEstado(),
          contarUsuariosUltimosMeses(),
        ]);
        setUsuarios(usuariosCount);
        setEjercicios(ejerciciosCount);
        setRutinas(rutinasCount);
        setMembresiasEstado(membresias);
        setUsuariosPorMes(usuariosMes);
      } catch (err) {
        console.error("Error al cargar los datos del dashboard:", err);
      } finally {
        setCargando(false);
      }
    }
    fetchDatos();
  }, []);

  const dataPie = [
    { name: "Activa", value: membresiasEstado.activa },
    { name: "Por vencer", value: membresiasEstado.puntoDeVencer },
    { name: "Vencida", value: membresiasEstado.vencida },
  ];

  if (cargando)
    return <p className="text-center text-gray-500 mt-8">Cargando datos...</p>;

  return (
    <div>
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-default">
          <h2 className="text-xl font-semibold mb-2 tracking-wide">Usuarios</h2>
          <p className="text-5xl font-extrabold">{usuarios}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-default">
          <h2 className="text-xl font-semibold mb-2 tracking-wide">Ejercicios</h2>
          <p className="text-5xl font-extrabold">{ejercicios}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center transform hover:scale-105 transition-transform cursor-default">
          <h2 className="text-xl font-semibold mb-2 tracking-wide">Rutinas</h2>
          <p className="text-5xl font-extrabold">{rutinas}</p>
        </div>
      </div>

      {/* Gráficos */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart de membresías */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">Estado de Membresías</h3>
          <PieChart width={450} height={350} className="mx-auto">
            <Pie
              data={dataPie}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {dataPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </div>

        {/* Bar Chart de usuarios por mes */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">Usuarios registrados (últimos 3 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usuariosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
