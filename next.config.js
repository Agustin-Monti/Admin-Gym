/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Ajusta el límite de tamaño del cuerpo
    },
  },
};

module.exports = nextConfig;
