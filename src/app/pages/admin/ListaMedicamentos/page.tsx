"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FaArrowLeft, FaPills, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AuthLogin } from "@/app/services/login";

// Interfaz
interface FichaMedica {
  IdAccion: number;
  DPIPaciente: string;
  NombrePaciente: string;
  NombreMedico: string;
  EspecialidadMedico: string;
  Medicamento: string;
  Cantidad: number;
  Frecuencia: string;
  StatusAccion: string;
}

function ListaMedicamentosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dpi = searchParams.get("dpi");
  const nombrePaciente = searchParams.get("nombrePaciente");

  const [medicamentos, setMedicamentos] = useState<FichaMedica[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarMedicamentos = async () => {
    if (!dpi) {
      setMedicamentos([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    const response = await AuthLogin.ListaMedicamentos(dpi);
    setMedicamentos(response);
    setCargando(false);
  };

  const handleQuitar = async (IdAccion: number) => {
    if (!confirm("¿Deseas quitar este medicamento?")) return;

    const resultado = await AuthLogin.quitarMedicamento(IdAccion);
    if (resultado === "correcto") {
      setMedicamentos(prev => prev.filter(m => m.IdAccion !== IdAccion));
      alert("Medicamento quitado correctamente");
    } else {
      alert("No se pudo quitar el medicamento");
    }
  };



  useEffect(() => {
    cargarMedicamentos();
  }, [dpi]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          <FaArrowLeft /> Regresar
        </button>

        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPills className="text-yellow-600" /> Medicamentos de {nombrePaciente || "Paciente"}
        </h1>
      </div>

      {cargando ? (
        <p className="text-gray-600">Cargando medicamentos...</p>
      ) : medicamentos.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">DPI</th>
                <th className="border px-4 py-2">Paciente</th>
                <th className="border px-4 py-2">Médico</th>
                <th className="border px-4 py-2">Especialidad</th>
                <th className="border px-4 py-2">Medicamento</th>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Frecuencia</th>
                <th className="border px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map(m => (
                <tr key={m.IdAccion} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{m.DPIPaciente}</td>
                  <td className="border px-4 py-2">{m.NombrePaciente}</td>
                  <td className="border px-4 py-2">{m.NombreMedico}</td>
                  <td className="border px-4 py-2">{m.EspecialidadMedico}</td>
                  <td className="border px-4 py-2">{m.Medicamento}</td>
                  <td className="border px-4 py-2 text-center">{m.Cantidad}</td>
                  <td className="border px-4 py-2 text-center">{m.Frecuencia}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleQuitar(m.IdAccion)}
                      className="flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      <FaTrash /> Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No hay medicamentos asignados para este paciente.</p>
      )}
    </div>
  );
}

export default function ListaMedicamentosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <ListaMedicamentosContent />
    </Suspense>
  );
}
