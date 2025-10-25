"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaFileMedical,
  FaPills,
  FaUserNurse,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaUserMd
} from "react-icons/fa";
import { AuthLogin } from "@/app/services/login"; // API

type Paciente = { id: number; nombre: string; dpi: string };
type Cita = { IdCita: number; DPI: string; NombrePaciente: string; Estado: string };

export default function PacientesPage() {
  const router = useRouter();

  // --- Datos del doctor ---
  const [nombre, setNombre] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
    setEspecialidad(localStorage.getItem("especialidad"));
  }, []);

  // --- Tabla de pacientes / Citas ---
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [Citas, setCitas] = useState<Cita[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const cargarPacientes = async () => {
    try {
      const response = await AuthLogin.listarUsuarios();
      if (response.users && Array.isArray(response.users)) {
        type PacienteRaw = { IdUsuario: number; Nombre: string; DPI: string };
        const formateados = response.users.map((p: unknown) => {
          const paciente = p as PacienteRaw;
          return {
            id: paciente.IdUsuario,
            nombre: paciente.Nombre,
            dpi: paciente.DPI,
          };
        });
        setPacientes(formateados);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };
Citas
  const cargarCitas = async () => {
    if (!nombre) return;
    setLoadingCitas(true);
    try {
      const result = await AuthLogin.listarCitasPorDoctor(nombre);
      if (Array.isArray(result.Citas)) {
        const CitasFormateadas: Cita[] = result.Citas.map((c: unknown) => {
          const cita = c as Cita;
          return {
            IdCita: cita.IdCita,
            DPI: cita.DPI,
            NombrePaciente: cita.NombrePaciente,
            Estado: cita.Estado,
          };
        });
        setCitas(CitasFormateadas);
      } else {
        setCitas([]);
      }
    } catch (error) {
      console.error("Error al cargar Citas por doctor:", error);
    }
    setLoadingCitas(false);
  };

  useEffect(() => {
    if (especialidad?.toLowerCase() === "general") {
      cargarPacientes();
    } else {
      cargarCitas();
    }
  }, [nombre, especialidad]);

  // --- Filtros dinámicos ---
  const [filtro, setFiltro] = useState<{ [key: string]: string }>({});
  const headers = ["Nombre", "DPI", "Acciones"];

  const pacientesFiltrados = pacientes.filter((item) =>
    headers.every((h) => {
      const key = h.toLowerCase().replace(" ", "");
      let value: string | number | undefined;
      if (key === "nombre") value = item.nombre;
      else if (key === "dpi") value = item.dpi;
      else value = undefined;
      if (!filtro[key]) return true;
      return (value?.toString().toLowerCase() || "").includes(filtro[key].toLowerCase());
    })
  );

  // --- Funciones de acción ---
  const handleCrearFicha = (dpi: string, nombrePaciente: string) => {
    router.push(
      `/pages/admin/FichaMedica?dpi=${dpi}&nombrePaciente=${encodeURIComponent(
        nombrePaciente
      )}&nombreMedico=${encodeURIComponent(nombre || "")}&especialidad=${encodeURIComponent(
        especialidad || ""
      )}`
    );
  };

  const handleMedicamento = (dpi: string, nombrePaciente: string) => {
    router.push(
      `/pages/admin/ListaMedicamentos?dpi=${dpi}&nombrePaciente=${encodeURIComponent(
        nombrePaciente
      )}&nombreMedico=${encodeURIComponent(nombre || "")}&especialidad=${encodeURIComponent(
        especialidad || ""
      )}`
    );
  };

  const handleAsignarEnfermero = (dpi: string, nombrePaciente: string) => {
    router.push(
      `/pages/admin/Enfermeros?dpi=${dpi}&nombrePaciente=${encodeURIComponent(nombrePaciente)}`
    );
  };

  const handleCrearCita = (dpi: string, nombrePaciente: string) => {
    router.push(
      `/pages/admin/CreacionCitas?dpi=${dpi}&nombrePaciente=${encodeURIComponent(nombrePaciente)}`
    );
  };

  const handleActualizarEstadoCita = async (IdCita: number, estado: "Completada" | "Cancelada") => {
    const res = await AuthLogin.actualizarEstadoCita(IdCita, estado);
    if (res === "correcto") {
      setCitas((prev) =>
        prev.map((c) => (c.IdCita === IdCita ? { ...c, Estado: estado } : c))
      );
    } else {
      alert("Error al actualizar la cita");
    }
  };

  const esGeneral = especialidad?.toLowerCase() === "general";

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-12">
      {/* Datos del doctor */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-lg font-semibold text-gray-800">
          Nombre: {nombre || "No disponible"}
        </p>
        <p className="text-lg font-semibold text-gray-800">
          Especialidad: {especialidad || "No disponible"}
        </p>
      </div>

      {/* Tabla de pacientes o Citas */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{esGeneral ? "Pacientes" : "Citas Asignadas"}</h2>
        </div>

        <div className="overflow-x-auto">
          {esGeneral ? (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {headers.map((h) => {
                    const key = h.toLowerCase().replace(" ", "");
                    return (
                      <th key={h} className="border px-4 py-2">
                        {h !== "Acciones" && (
                          <input
                            type="text"
                            placeholder={`Filtrar ${h}`}
                            value={filtro[key] || ""}
                            onChange={(e) =>
                              setFiltro({ ...filtro, [key]: e.target.value })
                            }
                            className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          />
                        )}
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{p.nombre}</td>
                    <td className="border px-4 py-2">{p.dpi}</td>
                    <td className="border px-4 py-2 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => handleCrearFicha(p.dpi, p.nombre)}
                          className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded min-w-[120px] hover:bg-green-700"
                        >
                          <FaFileMedical /> Crear Ficha
                        </button>

                        <button
                          onClick={() => handleMedicamento(p.dpi, p.nombre)}
                          className="flex items-center justify-center gap-1 bg-yellow-600 text-white px-3 py-2 rounded min-w-[120px] hover:bg-yellow-700"
                        >
                          <FaPills /> Ver Medicamentos
                        </button>

                        {/* Siempre disponible */}
                        <button
                          onClick={() => router.push(`/pages/admin/ListaFichasMedicas?dpi=${p.dpi}&nombre=${encodeURIComponent(p.nombre)}`)}
                          className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                        >
                          <FaUserMd /> Ver Fichas Médicas
                        </button>

                        {esGeneral && (
                          <>
                            <button
                              onClick={() => handleAsignarEnfermero(p.dpi, p.nombre)}
                              className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded min-w-[120px] hover:bg-blue-700"
                            >
                              <FaUserNurse /> Asignar Enfermero
                            </button>

                            <button
                              onClick={() => handleCrearCita(p.dpi, p.nombre)}
                              className="flex items-center justify-center gap-1 bg-purple-600 text-white px-3 py-2 rounded min-w-[120px] hover:bg-purple-700"
                            >
                              <FaCalendarAlt /> Crear Cita
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">No.Cita</th>
                  <th className="border px-4 py-2">Paciente</th>
                  <th className="border px-4 py-2">DPI</th>
                  <th className="border px-4 py-2">Estado</th>
                  <th className="border px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingCitas ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Cargando Citas...</td>
                  </tr>
                ) : Citas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No hay Citas asignadas</td>
                  </tr>
                ) : (
                  Citas.map((c) => (
                    <tr key={c.IdCita} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{c.IdCita}</td>
                      <td className="border px-4 py-2">{c.NombrePaciente}</td>
                      <td className="border px-4 py-2">{c.DPI}</td>
                      <td className="border px-4 py-2">{c.Estado}</td>
                      <td className="border px-4 py-2 text-center flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => handleCrearFicha(c.DPI, c.NombrePaciente)}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                        >
                          <FaFileMedical /> Crear Ficha
                        </button>

                        <button
                          onClick={() => handleMedicamento(c.DPI, c.NombrePaciente)}
                          className="flex items-center gap-1 bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
                        >
                          <FaPills /> Ver Medicamentos
                        </button>

                        <button
                          onClick={() => handleActualizarEstadoCita(c.IdCita, "Completada")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                        >
                          <FaCheck /> Completar
                        </button>
                        <button
                          onClick={() => handleActualizarEstadoCita(c.IdCita, "Cancelada")}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                        >
                          <FaTimes /> Cancelar
                        </button>

                        {/* Ver Fichas Médicas */}
                        <button
                          onClick={() => router.push(`/pages/admin/ListaFichasMedicas?dpi=${c.DPI}&nombre=${encodeURIComponent(c.NombrePaciente)}`)}
                          className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                        >
                          <FaUserMd /> Ver Fichas Médicas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
