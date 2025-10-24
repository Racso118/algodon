"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { AuthLogin, DetalleFichaMedica } from "@/app/services/login";

function DetalleFichasMedicasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFactura = searchParams.get("id");

  const [detalleFicha, setDetalleFicha] = useState<DetalleFichaMedica[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!idFactura) return;
      try {
        setCargando(true);
        const detalle = await AuthLogin.obtenerDetalleFicha(Number(idFactura));
        setDetalleFicha(detalle);
      } catch (error) {
        console.error("Error al cargar detalle de ficha:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDetalle();
  }, [idFactura]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando detalle de la ficha...
      </div>
    );
  }

  if (!detalleFicha.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600 p-4">
        <p>No se encontró detalle de ficha médica.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          <FaArrowLeft /> Regresar
        </button>
      </div>
    );
  }

  // Datos generales del paciente y médico del primer elemento
  const { DPIPaciente, NombrePaciente, NombreMedico, EspecialidadMedico, Fecha, Observaciones } =
    detalleFicha[0];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        <FaArrowLeft /> Regresar
      </button>

      <h2 className="text-2xl font-bold">Detalle de Ficha Médica</h2>

      {/* Sección Paciente */}
      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <h3 className="font-semibold text-lg">Datos del Paciente</h3>
        <p><span className="font-medium">Nombre:</span> {NombrePaciente}</p>
        <p><span className="font-medium">DPI:</span> {DPIPaciente}</p>
        <p><span className="font-medium">Fecha de la ficha:</span> {Fecha}</p>
      </div>

      {/* Sección Médico */}
      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <h3 className="font-semibold text-lg">Datos del Médico</h3>
        <p><span className="font-medium">Nombre:</span> {NombreMedico}</p>
        <p><span className="font-medium">Especialidad:</span> {EspecialidadMedico}</p>
      </div>

      {/* Sección Observaciones generales */}
      {Observaciones && (
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h3 className="font-semibold text-lg">Observaciones</h3>
          <p>{Observaciones}</p>
        </div>
      )}

      {/* Sección Acciones / Medicamentos en tabla */}
      <div className="bg-white rounded-lg shadow p-4 space-y-2 overflow-x-auto">
        <h3 className="font-semibold text-lg mb-2">Acciones</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2 text-left">Tipo Acción</th>
              <th className="border px-4 py-2 text-left">Nombre Acción</th>
              <th className="border px-4 py-2 text-left">Cantidad</th>
              <th className="border px-4 py-2 text-left">Frecuencia</th>
              <th className="border px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {detalleFicha.map((accion, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{accion.TipoAccion || "No definido"}</td>
                <td className="border px-4 py-2">{accion.NombreAccion || "-"}</td>
                <td className="border px-4 py-2">{accion.Cantidad ?? "-"}</td>
                <td className="border px-4 py-2">{accion.Frecuencia || "-"}</td>
                <td className="border px-4 py-2">{accion.StatusAccion || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DetalleFichasMedicasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <DetalleFichasMedicasContent />
    </Suspense>
  );
}
