// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm } from "formidable";

// Configuración para desactivar el body parser de Next.js (para manejar archivos)
export const config = {
  api: {
    bodyParser: false, // Desactivamos el body parser de Next.js para que `formidable` lo maneje
  },
};

interface ParsedForm {
  fields: { [key: string]: string | string[] };
  files: { [key: string]: formidable.File | formidable.File[] };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Usamos `formidable` para procesar el formulario
  const form = new IncomingForm();
  
  // Usamos una promesa para manejar el proceso de carga de archivos de forma asíncrona
  form.parse(req, (err: any, fields: any, files: any) => {
    if (err) {
      console.error("Error al procesar el formulario", err);
      return res.status(500).json({ message: "Error al procesar el formulario", error: err });
    }

    // Aquí puedes acceder a los archivos cargados
    console.log("Archivos recibidos:", files);

    // Respuesta de éxito
    return res.status(200).json({ message: "Archivo recibido", files });
  });
}
