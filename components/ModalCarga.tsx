// components/ModalCarga.tsx
export default function ModalCarga({ mensaje }: { mensaje: string }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium">{mensaje}</span>
        </div>
      </div>
    );
  }
  