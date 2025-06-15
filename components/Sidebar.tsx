"use client"; // Asegúrate de marcar este componente como "use client"

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  // Obtener el usuario autenticado
  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      }
    };
    obtenerUsuario();
  }, []);

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirigir al usuario a la página de inicio de sesión
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-4 fixed top-0 left-0 h-screen z-50 flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Menú</h2>
        <ul>
          <li className="mb-2">
            <Link href="/home">
              <span className="cursor-pointer block p-2 bg-gray-800 rounded">📋 Home</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/ejercicios">
              <span className="cursor-pointer block p-2 bg-gray-800 rounded">🏋️ Ejercicios</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/rutinas">
              <span className="cursor-pointer block p-2 bg-gray-800 rounded">📄 Rutinas</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/usuarios">
              <span className="cursor-pointer block p-2 bg-gray-800 rounded">👤 Usuarios</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Mostrar información del usuario y botón de cerrar sesión */}
      <div className="mt-auto border-t border-gray-700 pt-4">
        {user ? (
          <>
            <p className="text-sm">Hola, {user.email}</p>
            <button
              onClick={cerrarSesion}
              className="w-full mt-2 p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <p className="text-sm">No has iniciado sesión</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;