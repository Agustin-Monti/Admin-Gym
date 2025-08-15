import { Roboto } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image'; // Importar el componente Image para el logo

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
});

export default async function Index() {
  return (
    <>
      <main
        className={`${roboto.className} min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black relative`}
      >
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logousina2.png" // Ruta de tu logo (debe estar en la carpeta public)
            alt="Logo de OLEM"
            width={400} // Ancho del logo
            height={400} // Alto del logo
            className="" // Estilos adicionales para el logo
          />
        </div>

        

        {/* Botón de Iniciar Sesión */}
        <div className="mt-4">
          <Link
            href="/sign-in"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg shadow-blue-900/40 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-800"
          >
            Iniciar Sesión
          </Link>
        </div>
      </main>
    </>
  );
}
