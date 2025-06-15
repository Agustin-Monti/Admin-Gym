"use client";

import { useEffect, useState } from "react";
import { getUsuarios, getEjercicios, guardarRutina  } from "@/actions/rutinas-actions";
import LoadingModal from "@/components/LoadingModal";

interface Usuario {
    id: string;
    nombre: string;
    apellido: string;
}

interface EjercicioData {
    id: string;
    nombre: string;
    // otros campos si necesitás
}

type Ejercicio = {
    ejercicio_id: number;
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
      nombreDia: string; // ✅ importante
      ejercicios: {
        ejercicioId: number;
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
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
  

    // Fetch usuarios al montar
    useEffect(() => {
        const fetchData = async () => {
          const usuariosData = await getUsuarios();
          const ejerciciosData = await getEjercicios();
          setUsuarios(usuariosData);
          setEjerciciosDisponibles(ejerciciosData);
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
      ejercicio_id: 0,
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
  
    setModalOpen(true); // Mostrar el modal de carga
  
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
  
      console.log("Respuesta del servidor:", response); // 👈 importante para debug
  
      if (response?.success) {
        console.log("Rutina guardada exitosamente");
  
        // Mostrar modal de éxito
        setModalSuccess(true);
  
        // Reiniciar el formulario y ocultar el mensaje de éxito
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
      setModalOpen(false); // Ocultar el modal de carga
    }
  };
  
  
  


  


  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Crear nueva rutina</h2>

      {/* Usuario */}
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Seleccionar usuario</label>
            <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                className="border rounded w-full p-2"
            >
                <option value="">-- Seleccionar --</option>
                {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido}
                </option>
                ))}
            </select>
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
              <select
                value={ej.ejercicio_id}
                onChange={(e) => actualizarEjercicio(diaIndex, ejIndex, "ejercicio_id", e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="">-- Seleccionar 1 --</option>
                {ejerciciosDisponibles.map((ejercicio) => (
                  <option key={ejercicio.id} value={ejercicio.id}>
                    {ejercicio.nombre}
                  </option>
                ))}
              </select>
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

      {/* Botón guardar (todavía sin acción) */}
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



    </div>
  );
}
