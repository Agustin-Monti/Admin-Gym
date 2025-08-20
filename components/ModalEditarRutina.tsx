"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getEjercicios, getGruposMusculares } from "@/actions/rutinas-actions";

interface ModalEditarRutinaProps {
  rutinaId: string;
  onClose: () => void;
}

interface GrupoMuscular {
  id: string;
  nombre: string;
}

interface EjercicioData {
  id: string;
  nombre: string;
  grupo_id: string;
}

export default function ModalEditarRutina({ rutinaId, onClose }: ModalEditarRutinaProps) {
  const [rutina, setRutina] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ejercicios, setEjercicios] = useState<any[]>([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<EjercicioData[]>([]);
  const [gruposMusculares, setGruposMusculares] = useState<GrupoMuscular[]>([]);
  
  // Estados para el modal de ejercicios
  const [showEjerciciosModal, setShowEjerciciosModal] = useState(false);
  const [busquedaEjercicio, setBusquedaEjercicio] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos');
  const [ejercicioSeleccionadoIndex, setEjercicioSeleccionadoIndex] = useState<{ dia: number, ej: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchRutina = async () => {
      const { data, error } = await supabase
        .from("rutinas")
        .select(`
          id,
          nombre,
          dias_por_semana,
          fecha_creacion,
          profiles (
            nombre,
            apellido
          ),
          dias_rutina (
            id,
            numero_dia,
            nombre_dia,
            ejercicios_dia (
              id,
              series,
              repeticiones,
              peso,
              ejercicios (
                id,
                nombre
              )
            )
          )
        `)
        .eq("id", rutinaId)
        .single();

      if (error) {
        console.error("Error al cargar la rutina:", error);
      } else {
        setRutina(data);
      }
      setLoading(false);
    };

    const cargarDatos = async () => {
      const [ejerciciosData, gruposData] = await Promise.all([
        getEjercicios(),
        getGruposMusculares()
      ]);
      
      setEjerciciosDisponibles(ejerciciosData);
      setGruposMusculares(gruposData);
      
      // También cargar ejercicios para el select antiguo (por si acaso)
      const { data, error } = await supabase.from("ejercicios").select("*");
      if (!error) setEjercicios(data);
    };

    if (rutinaId) {
      fetchRutina();
      cargarDatos();
    }
  }, [rutinaId]);

  const actualizarEjercicio = (diaIndex: number, ejIndex: number, campo: string, valor: any) => {
    const nuevaRutina = { ...rutina };
    nuevaRutina.dias_rutina[diaIndex].ejercicios_dia[ejIndex][campo] = valor;
    setRutina(nuevaRutina);
  };

  const agregarEjercicio = (diaIndex: number) => {
    const nuevoEjercicio = {
      id: null,
      series: 3,
      repeticiones: 10,
      peso: 0,
      ejercicios: { 
        id: ejerciciosDisponibles[0]?.id || "",
        nombre: ejerciciosDisponibles[0]?.nombre || "" 
      },
    };
    
    const nuevaRutina = { ...rutina };
    nuevaRutina.dias_rutina[diaIndex].ejercicios_dia.push(nuevoEjercicio);
    setRutina(nuevaRutina);
  };

  const abrirModalEjercicios = (diaIndex: number, ejIndex: number) => {
    setEjercicioSeleccionadoIndex({ dia: diaIndex, ej: ejIndex });
    setShowEjerciciosModal(true);
    setBusquedaEjercicio('');
    setFiltroGrupo('todos');
  };

  const handleEjercicioSeleccionado = (ejercicioId: string) => {
    if (ejercicioSeleccionadoIndex) {
      const { dia, ej } = ejercicioSeleccionadoIndex;
      const ejercicioSeleccionado = ejerciciosDisponibles.find(e => e.id === ejercicioId);
      
      if (ejercicioSeleccionado) {
        const nuevaRutina = { ...rutina };
        nuevaRutina.dias_rutina[dia].ejercicios_dia[ej].ejercicios = {
          id: ejercicioSeleccionado.id,
          nombre: ejercicioSeleccionado.nombre
        };
        setRutina(nuevaRutina);
      }
    }
    setShowEjerciciosModal(false);
    setEjercicioSeleccionadoIndex(null);
  };

  const eliminarEjercicio = async (diaIndex: number, ejIndex: number) => {
    const ejercicio = rutina.dias_rutina[diaIndex].ejercicios_dia[ejIndex];

    if (ejercicio.id) {
      const supabase = createClient();
      const { error } = await supabase
        .from("ejercicios_dia")
        .delete()
        .eq("id", ejercicio.id);

      if (error) {
        console.error("Error al eliminar el ejercicio:", error);
        return;
      }
    }

    const nuevaRutina = { ...rutina };
    nuevaRutina.dias_rutina[diaIndex].ejercicios_dia.splice(ejIndex, 1);
    setRutina(nuevaRutina);
  };

  const handleGuardar = async () => {
    const supabase = createClient();

    // Actualizar rutina principal
    const { error: errorRutina } = await supabase
      .from("rutinas")
      .update({
        nombre: rutina.nombre,
        dias_por_semana: rutina.dias_por_semana,
      })
      .eq("id", rutina.id);

    if (errorRutina) {
      console.error("Error al actualizar rutina:", errorRutina);
      return;
    }

    for (const dia of rutina.dias_rutina) {
      const { error: errorDia } = await supabase
        .from("dias_rutina")
        .update({ nombre_dia: dia.nombre_dia })
        .eq("id", dia.id);

      if (errorDia) {
        console.error("Error al actualizar día:", errorDia);
        continue;
      }

      for (const ejercicio of dia.ejercicios_dia) {
        if (ejercicio.id) {
          const { error: errorEj } = await supabase
            .from("ejercicios_dia")
            .update({
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              peso: ejercicio.peso,
              ejercicio_id: ejercicio.ejercicios.id,
            })
            .eq("id", ejercicio.id);

          if (errorEj) console.error("Error al actualizar ejercicio:", errorEj);
        } else {
          const { error: errorInsert } = await supabase
            .from("ejercicios_dia")
            .insert({
              dia_rutina_id: dia.id,
              ejercicio_id: ejercicio.ejercicios.id,
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              peso: ejercicio.peso,
            });

          if (errorInsert) console.error("Error al insertar nuevo ejercicio:", errorInsert);
        }
      }
    }

    alert("Rutina actualizada correctamente");
    onClose();
  };

  if (loading) return <div className="p-4">Cargando rutina...</div>;
  if (!rutina) return <div className="p-4 text-red-500">No se encontró la rutina.</div>;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[900px] max-h-[100vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Editar Rutina: {rutina.nombre}</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <input
              type="text"
              value={`${rutina.profiles?.nombre} ${rutina.profiles?.apellido}`}
              disabled
              className="border rounded w-full p-2 bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Días por semana</label>
            <input
              type="text"
              value={`${rutina.dias_por_semana} días`}
              disabled
              className="border rounded w-full p-2 bg-gray-100"
            />
          </div>

          {rutina.dias_rutina?.map((dia: any, diaIndex: number) => (
            <div key={dia.id} className="mt-4 mb-6 border p-4 rounded">
              <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium">Nombre del Día:</label>
                <input
                  type="text"
                  value={dia.nombre_dia || ""}
                  onChange={(e) => {
                    const nuevaRutina = { ...rutina };
                    nuevaRutina.dias_rutina[diaIndex].nombre_dia = e.target.value;
                    setRutina(nuevaRutina);
                  }}
                  className="border rounded p-2 w-full"
                />
                <button
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => agregarEjercicio(diaIndex)}
                >
                  + Añadir ejercicio
                </button>
              </div>

              {dia.ejercicios_dia?.map((ej: any, ejIndex: number) => (
                <div key={ej.id || `new-${ejIndex}`} className="grid grid-cols-6 gap-4 mb-4 items-end">
                  <div>
                    <label className="text-sm font-medium">Ejercicio</label>
                    <button
                      onClick={() => abrirModalEjercicios(diaIndex, ejIndex)}
                      className="border rounded p-2 w-full text-left bg-white hover:bg-gray-100"
                    >
                      {ej.ejercicios?.nombre || 'Seleccionar ejercicio'}
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Series</label>
                    <input
                      type="number"
                      value={ej.series}
                      onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "series", parseInt(e.target.value))}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reps</label>
                    <input
                      type="number"
                      value={ej.repeticiones}
                      onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "repeticiones", parseInt(e.target.value))}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Peso</label>
                    <input
                      type="number"
                      value={ej.peso}
                      onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "peso", parseFloat(e.target.value))}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  <div className="flex justify-center items-center">
                    <button
                      onClick={() => eliminarEjercicio(diaIndex, ejIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Cancelar
            </button>
            <button onClick={handleGuardar} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Selección de Ejercicios */}
      {showEjerciciosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Seleccionar Ejercicio</h3>
            
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar por nombre</label>
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={busquedaEjercicio}
                  onChange={(e) => setBusquedaEjercicio(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Filtrar por grupo muscular</label>
                <select
                  value={filtroGrupo}
                  onChange={(e) => setFiltroGrupo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="todos">Todos los grupos</option>
                  {gruposMusculares.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Lista de ejercicios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ejerciciosDisponibles
                .filter((ejercicio) => {
                  const coincideNombre = ejercicio.nombre?.toLowerCase().includes(busquedaEjercicio.toLowerCase());
                  const coincideGrupo = filtroGrupo === 'todos' || String(ejercicio.grupo_id) === String(filtroGrupo);
                  return coincideNombre && coincideGrupo;
                })
                .map((ejercicio) => {
                  const grupoMuscular = gruposMusculares.find(
                    g => Number(g.id) === Number(ejercicio.grupo_id)
                  )?.nombre || 'Sin grupo';
                  
                  return (
                    <div
                      key={ejercicio.id}
                      onClick={() => handleEjercicioSeleccionado(ejercicio.id)}
                      className="border rounded p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{ejercicio.nombre || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Grupo: {grupoMuscular}
                      </p>
                    </div>
                  );
                })}
            </div>
            
            {/* Mensaje si no hay resultados */}
            {ejerciciosDisponibles.filter(ejercicio => {
              const coincideNombre = ejercicio.nombre?.toLowerCase().includes(busquedaEjercicio.toLowerCase());
              const coincideGrupo = filtroGrupo === 'todos' || String(ejercicio.grupo_id) === String(filtroGrupo);
              return coincideNombre && coincideGrupo;
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron ejercicios con los filtros aplicados
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowEjerciciosModal(false);
                  setEjercicioSeleccionadoIndex(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
