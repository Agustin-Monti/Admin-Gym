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
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Iniciar Sesión
          </Link>
        </div>
      </main>
    </>
  );
}
