"use client";

import { useEffect, useState } from "react";
import { getRutinas } from "@/actions/rutinas-actions";
import ModalEditarRutina from "@/components/ModalEditarRutina"; // importar componente


export default function RutinasTable() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<any>(null);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        console.log("Llamando a getRutinas...");
        const data = await getRutinas();
        console.log("Datos recibidos:", data);
        setRutinas(data);
      } catch (error) {
        console.error("Error al obtener rutinas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  const abrirModalEdicion = (rutina: any) => {
    console.log("Abrir modal para rutina con ID:", rutina.id);
    setRutinaSeleccionada(rutina);
  };

  const rutinasFiltradas = rutinas.filter((rutina) => {
    const nombreCompleto =
      `${rutina.profiles?.nombre ?? ""} ${rutina.profiles?.apellido ?? ""}`.toLowerCase();
    return nombreCompleto.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Rutinas Creadas</h2>


      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre de usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>



      {loading ? (
        <p>Cargando rutinas...</p>
      ) : rutinas.length === 0 ? (
        <p>No hay rutinas registradas.</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="p-2">Usuario</th>
              <th className="p-2">Nombre de rutina</th>
              <th className="p-2">Días</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rutinas.map((rutina) => (
              <tr key={rutina.id} className="border-t">
                <td className="p-2">
                  {rutina.profiles?.nombre} {rutina.profiles?.apellido}
                </td>
                <td className="p-2">{rutina.nombre}</td>
                <td className="p-2">{rutina.dias_por_semana}</td>
                <td className="p-2">
                  <button
                    onClick={() => abrirModalEdicion(rutina)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rutinaSeleccionada && (
        <ModalEditarRutina
          rutinaId={rutinaSeleccionada.id}
          onClose={() => setRutinaSeleccionada(null)}
        />
      )}
    </div>
  );
}
