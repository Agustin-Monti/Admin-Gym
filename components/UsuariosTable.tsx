"use client";

import { useState } from "react";
import ModalUsuario from "@/components/ModalUsuario";
import ModalMembresia from "@/components/ModalMembresia";
import { actualizarUsuario, eliminarUsuario, getUsuarios } from "@/actions/usuarios-actions";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  admin: boolean;
  created_at: string;
  updated_at: string;
  fecha_membresia?: string;
}

interface UsuariosTableProps {
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  refetchUsuarios: () => Promise<void>; // ✅ nueva prop
}


export default function UsuariosTable({ usuarios, setUsuarios, refetchUsuarios, }: UsuariosTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc');
  const [ordenColumna, setOrdenColumna] = useState<'empresa'>('empresa');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isMembresiaModalOpen, setIsMembresiaModalOpen] = useState(false);
  const [usuarioParaMembresia, setUsuarioParaMembresia] = useState<Usuario | null>(null);
  const [membresiaEnProceso, setMembresiaEnProceso] = useState<string | null>(null);
  const [membresiaGuardada, setMembresiaGuardada] = useState<string | null>(null);



  


  const usuariosOrdenados = [...usuarios].sort((a, b) => {
    const nombreA = a.nombre?.toLowerCase() || '';
    const nombreB = b.nombre?.toLowerCase() || '';

    return orden === 'asc'
      ? nombreA.localeCompare(nombreB)
      : nombreB.localeCompare(nombreA);
  });

  const handleViewUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleActualizarRol = async (id: string, nuevoAdmin: boolean, nuevaDemandaGratis: boolean) => {
    try {
      const updatedUsuario = await actualizarUsuario(id, {
        admin: nuevoAdmin,
        demanda_gratis: nuevaDemandaGratis,
      });

      if (!updatedUsuario) throw new Error("No se recibió respuesta del servidor");

      setUsuarios(usuarios.map(u =>
        u.id === id
          ? { ...u, admin: nuevoAdmin, demanda_gratis: nuevaDemandaGratis }
          : u
      ));

      alert("✅ Cambios guardados correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      alert(`❌ ${error instanceof Error ? error.message : "Error al guardar cambios"}`);
    }

    handleCerrarModal();
  };

  const handleEliminarUsuario = async (id: string) => {
    console.log("Eliminando usuario con ID:", id);
    setIsDeleting(true);
    setDeleteMessage("Eliminando usuario...");

    try {
      const eliminado = await eliminarUsuario(id);
      console.log('Usuario eliminado:', eliminado);
      if (!eliminado) throw new Error("Error al eliminar el usuario");

      setDeleteMessage("Enviando notificación...");

      const usuario = usuarios.find(u => u.id === id);
      if (usuario) {
        const mailResponse = await fetch('/api/mail-usuario-eliminado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: usuario.email, nombre: usuario.nombre }),
        });

        if (!mailResponse.ok) {
          const mailResult = await mailResponse.json();
          throw new Error(mailResult.message || "Error al enviar correo");
        }
      }

      setUsuarios(usuarios.filter(u => u.id !== id));
      setDeleteMessage("¡Usuario eliminado con éxito!");
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      setDeleteMessage("❌ Error: " + (error instanceof Error ? error.message : "Error desconocido"));
    } finally {
      setIsDeleting(false);
      handleCerrarModal();
    }
  };

  const handleGuardarMembresia = async (userId: string, fecha: string) => {
    setMembresiaEnProceso(userId);
    setMembresiaGuardada(null);

    try {
      const res = await fetch("/api/admin/actualizar-membresia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fecha }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar membresía");
      }

      // 🔁 Actualizar el usuario manualmente en el frontend
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, fecha_membresia: fecha } : u
        )
      );

      setMembresiaGuardada(userId);
      setTimeout(() => setMembresiaGuardada(null), 3000);
    } catch (err) {
      console.error(err);
      alert("❌ " + (err instanceof Error ? err.message : "Error desconocido"));
    } finally {
      setMembresiaEnProceso(null);
      setIsMembresiaModalOpen(false);
      setUsuarioParaMembresia(null);
    }
  };




  function renderEstadoMembresia(fecha: string | undefined) {
      if (!fecha) {
      return (
        <span className="inline-flex items-center gap-1 text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
          <XCircle className="w-4 h-4 text-gray-500" />
          Sin fecha
        </span>
      );
    }

    const inicio = new Date(fecha);
    const vencimiento = new Date(inicio);
    vencimiento.setMonth(vencimiento.getMonth() + 1);
    const ahora = new Date();

    const diasRestantes = Math.ceil(
      (vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
          <XCircle className="w-4 h-4" />
          Vencida
        </span>
      );
    } else if (diasRestantes <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-4 h-4" />
          Por vencer ({diasRestantes} días)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-4 h-4" />
          Activa ({diasRestantes} días)
        </span>
      );
    }
  }




  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {usuariosOrdenados.map((usuario) => (
        <div
          key={usuario.id}
          className="bg-white shadow-lg rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-sm text-gray-500">{usuario.email}</p>
            </div>
            {usuario.admin && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className="text-sm text-gray-700 mb-3">
            Membresía: {renderEstadoMembresia(usuario.fecha_membresia)}
          </div>


          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleViewUsuario(usuario)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md shadow-sm transition"
            >
              Editar
            </button>
            <button
              onClick={() => handleEliminarUsuario(usuario.id)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md shadow-sm transition"
            >
              Eliminar
            </button>
            <button
              onClick={() => {
                setUsuarioParaMembresia(usuario);
                setIsMembresiaModalOpen(true);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-3 py-1 rounded-md shadow-sm transition"
            >
              Membresía
            </button>
            {membresiaEnProceso === usuario.id && (
              <p className="text-sm text-blue-600 mt-2">⏳ Guardando membresía...</p>
            )}

            {membresiaGuardada === usuario.id && (
              <p className="text-sm text-green-600 mt-2">✅ Membresía guardada correctamente</p>
            )}

          </div>
        </div>
      ))}

      {/* Modales */}
      {isModalOpen && selectedUsuario && (
        <ModalUsuario
          isOpen={isModalOpen}
          usuario={selectedUsuario}
          onClose={handleCerrarModal}
          onActualizar={handleActualizarRol}
        />
      )}

      {isMembresiaModalOpen && usuarioParaMembresia && (
        <ModalMembresia
          isOpen={isMembresiaModalOpen}
          usuario={usuarioParaMembresia}
          onClose={() => {
            setIsMembresiaModalOpen(false);
            setUsuarioParaMembresia(null);
          }}
          onGuardar={handleGuardarMembresia}
        />
      )}
  </div>
  );
}
