"use client";

import { useEffect, useState } from "react";
import { FaPills } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AuthLogin, EnfermeroAsignado } from "@/app/services/login";

export default function PacientesEnfermeroPage() {
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState<EnfermeroAsignado[]>([]);
  const [filtro, setFiltro] = useState<{ DPIPaciente?: string; NombrePaciente?: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [nombreEnfermero, setNombreEnfermero] = useState<string | null>(null);

  useEffect(() => {
    // Esto asegura que solo se haga en el cliente
    const nombre = localStorage.getItem("nombre") || "—";
    setNombreEnfermero(nombre);

    const fetchAsignaciones = async () => {
      setLoading(true);
      const result = await AuthLogin.listarEnfermeroAsignado(nombre);
      if (result.asignaciones && Array.isArray(result.asignaciones)) {
        setAsignaciones(result.asignaciones);
      }
      setLoading(false);
    };

    fetchAsignaciones();
  }, []);

  // Mientras no tenemos el nombre, no renderizamos la tabla
  if (!nombreEnfermero) {
    return <p>Cargando información del enfermero...</p>;
  }

  // Filtrado explícito
  const dataFiltrada = asignaciones.filter((item) => {
    const matchDPI = filtro.DPIPaciente
      ? item.DPIPaciente.toLowerCase().includes(filtro.DPIPaciente.toLowerCase())
      : true;
    const matchNombre = filtro.NombrePaciente
      ? item.NombrePaciente.toLowerCase().includes(filtro.NombrePaciente.toLowerCase())
      : true;
    return matchDPI && matchNombre;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-4">
        Pacientes del enfermero: {nombreEnfermero}
      </h2>

      {loading ? (
        <p>Cargando asignaciones...</p>
      ) : asignaciones.length === 0 ? (
        <p>No hay pacientes asignados.</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">
                  <input
                    type="text"
                    placeholder="Filtrar DPI"
                    value={filtro.DPIPaciente || ""}
                    onChange={(e) =>
                      setFiltro({ ...filtro, DPIPaciente: e.target.value })
                    }
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  DPI Paciente
                </th>
                <th className="border px-4 py-2">
                  <input
                    type="text"
                    placeholder="Filtrar Nombre"
                    value={filtro.NombrePaciente || ""}
                    onChange={(e) =>
                      setFiltro({ ...filtro, NombrePaciente: e.target.value })
                    }
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  Nombre Paciente
                </th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item) => (
                <tr key={item.IdAsignacion} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{item.DPIPaciente}</td>
                  <td className="border px-4 py-2">{item.NombrePaciente}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/pages/admin/ListaMedicamentos?dpi=${item.DPIPaciente}&nombre=${encodeURIComponent(
                            item.NombrePaciente
                          )}`
                        )
                      }
                      className="bg-orange-500 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-orange-600"
                    >
                      <FaPills />
                      Medicamentos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
