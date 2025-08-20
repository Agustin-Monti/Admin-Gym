"use client";

import { useEffect, useState } from "react";
import { getUsuarios, getEjercicios, guardarRutina, getGruposMusculares } from "@/actions/rutinas-actions";
import LoadingModal from "@/components/LoadingModal";

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
}

interface GrupoMuscular {
  id: string;
  nombre: string;
}

interface EjercicioData {
    id: string;
    nombre: string;
    grupo_id: string; // ← Cambiado de grupo_id a grupo_id
}

type Ejercicio = {
  ejercicio_id: string; 
  series: number;
  repeticiones: number;
  peso: number;
};

interface DiaRutina {
  dia: number;
  ejercicios: Ejercicio[];
  nombre: string;
}

interface DatosRutina {
    usuarioId: string;
    nombre: string;
    diasPorSemana: number;
    ejercicios: {
      numeroDia: number;
      nombreDia: string;
      ejercicios: {
        ejercicioId: string;
        series: number;
        repeticiones: number;
        peso: number;
      }[];
    }[];
}

export default function CrearRutinaForm() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuarioId, setUsuarioId] = useState<string>(""); 
    const [numDias, setNumDias] = useState<number>(0);
    const [rutina, setRutina] = useState<DiaRutina[]>([]);
    const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<EjercicioData[]>([]);
    const [gruposMusculares, setGruposMusculares] = useState<GrupoMuscular[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [showUsuariosModal, setShowUsuariosModal] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [showEjerciciosModal, setShowEjerciciosModal] = useState(false);
    const [busquedaEjercicio, setBusquedaEjercicio] = useState('');
    const [filtroGrupo, setFiltroGrupo] = useState<string>('todos');
    const [ejercicioSeleccionadoIndex, setEjercicioSeleccionadoIndex] = useState<{ dia: number, ej: number } | null>(null);

    // Fetch usuarios, ejercicios y grupos musculares al montar
    useEffect(() => {
      const fetchData = async () => {
        const usuariosData = await getUsuarios();
        const ejerciciosData = await getEjercicios();
        const gruposData = await getGruposMusculares();

        setUsuarios(usuariosData);
        setEjerciciosDisponibles(
          ejerciciosData.map((e: any) => ({
            ...e,
            id: String(e.id),
            grupo_id: String(e.grupo_id || '') // ← Cambiado aquí
          }))
        );
        setGruposMusculares(gruposData);
      };
      fetchData();
  }, []);

  const inicializarDias = (cantidad: number) => {
    const nuevosDias: DiaRutina[] = [];
    for (let i = 1; i <= cantidad; i++) {
        nuevosDias.push({ dia: i, nombre: `Día ${i}`, ejercicios: [] });
    }
    setRutina(nuevosDias);
  };

  const agregarEjercicio = (diaIndex: number) => {
    const nuevosDias = [...rutina];
    nuevosDias[diaIndex].ejercicios.push({
      ejercicio_id: "",
      series: 0,
      repeticiones: 0,
      peso: 0,
    });
    setRutina(nuevosDias);
  };

  const actualizarEjercicio = (
    diaIndex: number,
    ejIndex: number,
    campo: keyof Ejercicio,
    valor: string | number
  ) => {
    const nuevosDias = [...rutina];
    nuevosDias[diaIndex].ejercicios[ejIndex][campo] = valor as never;
    setRutina(nuevosDias);
  };

  const eliminarEjercicio = (diaIndex: number, ejIndex: number) => {
    const nuevosDias = [...rutina];
    nuevosDias[diaIndex].ejercicios.splice(ejIndex, 1);
    setRutina(nuevosDias);
  };
  
  const handleGuardar = async () => {
    if (!usuarioId || numDias === 0 || rutina.length === 0) {
      console.log("Faltan datos.");
      return;
    }
  
    setModalOpen(true);
  
    const datosRutina: DatosRutina = {
      usuarioId,
      nombre: `Rutina de ${usuarios.find(u => u.id === usuarioId)?.nombre} ${usuarios.find(u => u.id === usuarioId)?.apellido}`,
      diasPorSemana: numDias,
      ejercicios: rutina.map(dia => ({
        numeroDia: dia.dia,
        nombreDia: dia.nombre,
        ejercicios: dia.ejercicios.map(ej => ({
          ejercicioId: ej.ejercicio_id,
          series: ej.series,
          repeticiones: ej.repeticiones,
          peso: ej.peso,
        })),
      })),
    };
  
    try {
      const response = await guardarRutina(
        datosRutina.nombre,
        datosRutina.diasPorSemana,
        datosRutina.ejercicios,
        datosRutina.usuarioId
      );
  
      console.log("Respuesta del servidor:", response);
  
      if (response?.success) {
        console.log("Rutina guardada exitosamente");
        setModalSuccess(true);
  
        setTimeout(() => {
          setUsuarioId("");
          setNumDias(0);
          setRutina([]);
          setModalSuccess(false);
        }, 3000);
      } else {
        console.error("Hubo un error al guardar la rutina");
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setModalOpen(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Crear nueva rutina</h2>

      {/* Usuario */}
      <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Seleccionar usuario</label>
          <button
            onClick={() => setShowUsuariosModal(true)}
            className="border p-2 rounded w-full text-left bg-white hover:bg-gray-100"
          >
            {usuarioId
              ? `${usuarios.find((u) => u.id === usuarioId)?.nombre} ${usuarios.find((u) => u.id === usuarioId)?.apellido}`
              : 'Seleccionar usuario'}
          </button>
      </div>

      {/* Número de días */}
      <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cantidad de días</label>
          <select
              value={numDias}
              onChange={(e) => {
              const cant = parseInt(e.target.value);
              setNumDias(cant);
              inicializarDias(cant);
              }}
              className="border rounded w-full p-2"
          >
              <option value={0}>-- Seleccionar --</option>
              {[2, 3, 4, 5].map((dia) => (
              <option key={dia} value={dia}>
                  {dia} días
              </option>
              ))}
          </select>
      </div>

      {/* Días y ejercicios */}
      {numDias > 0 && rutina.map((dia, diaIndex) => (
        <div key={diaIndex} className="mb-6 border p-4 rounded">
            <div className="flex items-center gap-4 mb-2">
                <h3 className="font-semibold">Día {dia.dia}</h3>
                <input
                    type="text"
                    placeholder="Nombre del día (Ej. Pecho y Tríceps)"
                    value={dia.nombre || ""}
                    onChange={(e) => {
                    const nuevosDias = [...rutina];
                    nuevosDias[diaIndex].nombre = e.target.value;
                    setRutina(nuevosDias);
                    }}
                    className="border rounded p-2"
                />
            </div>

          {dia.ejercicios.map((ej, ejIndex) => (
            <div key={ejIndex} className="grid grid-cols-5 gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ejercicio</label>
              <button
                type="button"
                onClick={() => {
                  setEjercicioSeleccionadoIndex({ dia: diaIndex, ej: ejIndex });
                  setShowEjerciciosModal(true);
                }}
                className="border rounded p-2 w-full text-left bg-white hover:bg-gray-100"
              >
                {ejerciciosDisponibles.find((e) => e.id === String(ej.ejercicio_id))?.nombre || 'Seleccionar ejercicio'}
              </button>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Series</label>
              <input
                type="number"
                value={ej.series}
                onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "series", parseInt(e.target.value))}
                className="border rounded p-2 w-full"
              />
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input
                type="number"
                value={ej.repeticiones}
                onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "repeticiones", parseInt(e.target.value))}
                className="border rounded p-2 w-full"
              />
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
              <input
                type="number"
                value={ej.peso}
                onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "peso", parseFloat(e.target.value))}
                className="border rounded p-2 w-full"
              />
            </div>
          
            <div className="flex justify-end items-center h-full">
              <button
                type="button"
                onClick={() => eliminarEjercicio(diaIndex, ejIndex)}
                className="text-red-600 text-sm hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
          ))}

          <button
            type="button"
            onClick={() => agregarEjercicio(diaIndex)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Agregar ejercicio
          </button>
        </div>
      ))}

      {/* Botón guardar */}
      <button
        type="button"
        onClick={handleGuardar}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Guardar rutina
      </button>

      <LoadingModal isOpen={modalOpen} message="Guardando rutina..." />

      <LoadingModal
        isOpen={modalSuccess}
        success={true}
        message="¡Rutina creada correctamente!"
        onClose={() => setModalSuccess(false)}
      />

      {/* MODAL DE USUARIOS */}
      {showUsuariosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Seleccionar Usuario</h3>

            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usuarios
                .filter((usuario) =>
                  `${usuario.nombre} ${usuario.apellido}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
                )
                .map((usuario) => (
                  <div
                    key={usuario.id}
                    onClick={() => {
                      setUsuarioId(usuario.id);
                      setShowUsuariosModal(false);
                    }}
                    className={`border rounded p-4 cursor-pointer hover:bg-gray-100 ${
                      usuarioId === usuario.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <p className="font-medium">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="text-sm text-gray-600">ID: {usuario.id}</p>
                  </div>
                ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowUsuariosModal(false)}
                className="text-sm text-red-600 hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EJERCICIOS MEJORADO */}
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
            // CORRECCIÓN AQUÍ: Convertir ambos a número para comparar
            const grupoMuscular = gruposMusculares.find(
              g => Number(g.id) === Number(ejercicio.grupo_id)
            )?.nombre || 'Sin grupo';
            
            return (
              <div
                key={ejercicio.id}
                onClick={() => {
                  if (ejercicioSeleccionadoIndex) {
                    const { dia, ej } = ejercicioSeleccionadoIndex;
                    const nuevosDias = [...rutina];
                    nuevosDias[dia].ejercicios[ej].ejercicio_id = ejercicio.id;
                    setRutina(nuevosDias);
                  }
                  setShowEjerciciosModal(false);
                }}
                className="border rounded p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{ejercicio.nombre || 'Sin nombre'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Grupo: {grupoMuscular}
                </p>
                <p className="text-xs text-gray-500 mt-1">ID Ejercicio: {ejercicio.id}</p>
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
          onClick={() => setShowEjerciciosModal(false)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
