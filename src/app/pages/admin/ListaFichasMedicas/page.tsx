"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaArrowLeft } from "react-icons/fa";
import { AuthLogin,FichaUsuario } from "@/app/services/login";

function FichasMedicasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dpi = searchParams.get("dpi") || "";
  const nombrePaciente = searchParams.get("nombre") || "";

  const [fichasMedicas, setFichasMedicas] = useState<FichaUsuario[]>([]);
  const [filtro, setFiltro] = useState({ paciente: "", doctor: "", especialidad: "", fecha: "" });

  // --- Cargar fichas ---
  useEffect(() => {
    const cargarFichas = async () => {
      if (!dpi) return;
      try {
        const fichas = await AuthLogin.ListaFichasUsuario(dpi);
        setFichasMedicas(fichas);
      } catch (error) {
        console.error("Error al cargar fichas médicas:", error);
      }
    };
    cargarFichas();
  }, [dpi]);

  const fichasFiltradas = fichasMedicas.filter(ficha =>
    ficha.NombrePaciente.toLowerCase().includes(filtro.paciente.toLowerCase()) &&
    ficha.Doctor.toLowerCase().includes(filtro.doctor.toLowerCase()) &&
    ficha.EspecialidadMedico.toLowerCase().includes(filtro.especialidad.toLowerCase()) &&
    ficha.Fecha.includes(filtro.fecha)
  );

  const handleVerFicha = (idFactura: number) => {
    router.push(`/pages/admin/DetalleFichasMedicas?id=${idFactura}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        <FaArrowLeft /> Regresar
      </button>

      <h2 className="text-2xl font-bold">
        Historial de Fichas Médicas de: {nombrePaciente || "Paciente"}
      </h2>

      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">
                <input
                  type="text"
                  placeholder="Filtrar No.Factura"
                  value={filtro.fecha} // Podrías agregar otro filtro específico si quieres
                  onChange={e => setFiltro({ ...filtro, fecha: e.target.value })}
                  className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                No. Factura
              </th>
              <th className="border px-4 py-2">
                <input
                  type="text"
                  placeholder="Filtrar Paciente"
                  value={filtro.paciente}
                  onChange={e => setFiltro({ ...filtro, paciente: e.target.value })}
                  className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                Nombre Paciente
              </th>
              <th className="border px-4 py-2">
                <input
                  type="text"
                  placeholder="Filtrar Doctor"
                  value={filtro.doctor}
                  onChange={e => setFiltro({ ...filtro, doctor: e.target.value })}
                  className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                Nombre Doctor
              </th>
              <th className="border px-4 py-2">
                <input
                  type="text"
                  placeholder="Filtrar Especialidad"
                  value={filtro.especialidad}
                  onChange={e => setFiltro({ ...filtro, especialidad: e.target.value })}
                  className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                Especialidad
              </th>
              <th className="border px-4 py-2">
                <input
                  type="text"
                  placeholder="Filtrar Fecha"
                  value={filtro.fecha}
                  onChange={e => setFiltro({ ...filtro, fecha: e.target.value })}
                  className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                Fecha
              </th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fichasFiltradas.map((ficha, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{ficha.IdFactura}</td>
                <td className="border px-4 py-2">{ficha.NombrePaciente}</td>
                <td className="border px-4 py-2">{ficha.Doctor}</td>
                <td className="border px-4 py-2">{ficha.EspecialidadMedico}</td>
                <td className="border px-4 py-2">{ficha.Fecha}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleVerFicha(ficha.IdFactura)}
                    className="flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    <FaEye className="mr-2" /> Ver
                  </button>
                </td>
              </tr>
            ))}
            {fichasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="border px-4 py-2 text-center text-gray-500">
                  No se encontraron fichas médicas para este paciente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FichasMedicasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <FichasMedicasContent />
    </Suspense>
  );
}
