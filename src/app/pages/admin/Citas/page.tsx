"use client";
import { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { AuthLogin } from "@/app/services/login";

interface Cita {
  id: number;
  dpi: string;
  paciente: string;
  doctor: string;
  especialidad: string;
  estado: string;
  fecha: string | null;
  razon: string;
  especialista: string;
}

export default function CitasPage() {
  const [Citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({
    paciente: "",
    doctor: "",
    fecha: "",
    estado: "",
  });

  const [nombre, setNombre] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);
  const [dpi, setDPI] = useState<string | null>(null);

  const [citaEditando, setCitaEditando] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

  // 🔹 Cargar datos del usuario
  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
    setEspecialidad(localStorage.getItem("especialidad"));
    setDPI(localStorage.getItem("dpi"));
  }, []);

  // 🔹 Cargar Citas según especialidad
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let resp;

        if (especialidad === "Paciente" && dpi) {
          resp = await AuthLogin.listarCitasPorDPI(dpi);
        } else {
          resp = await AuthLogin.listarCitas();
        }

        if (resp && Array.isArray(resp.Citas)) {
          type CitaRaw = {
            IdCita: number;
            DPI: string;
            NombrePaciente: string;
            NombreDoctor: string;
            Especialidad: string;
            Estado?: string;
            FechaCita: string | null;
            Razon: string;
            NombreEspecialista: string;
          };
          const dataFormateada: Cita[] = resp.Citas.map((c: unknown) => {
            const cita = c as CitaRaw;
            return {
              id: cita.IdCita,
              dpi: cita.DPI,
              paciente: cita.NombrePaciente,
              doctor: cita.NombreDoctor,
              especialidad: cita.Especialidad,
              estado: cita.Estado || "Pendiente",
              fecha: cita.FechaCita,
              razon: cita.Razon,
              especialista: cita.NombreEspecialista,
            };
          });
          setCitas(dataFormateada);
        }
      } catch (error) {
        console.error("Error al obtener Citas:", error);
      } finally {
        setLoading(false);
      }
    };

    if (nombre && especialidad) {
      fetchCitas();
    }
  }, [nombre, especialidad, dpi]);

  const CitasFiltradas = Citas.filter(
    (c) =>
      c.paciente.toLowerCase().includes(filtro.paciente.toLowerCase()) &&
      c.doctor.toLowerCase().includes(filtro.doctor.toLowerCase()) &&
      (c.fecha ? c.fecha.includes(filtro.fecha) : true) &&
      (filtro.estado === "" || c.estado.toLowerCase() === filtro.estado.toLowerCase())
  );

  const getEstadoStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "asignada":
        return "bg-sky-500 text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "terminada":
        return "bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "cancelada":
        return "bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold";
      default:
        return "bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold";
    }
  };

  const handleAsignarFecha = (id: number) => {
    setCitaEditando(id);
    setNuevaFecha("");
  };

  const handleGuardarFecha = async (id: number) => {
    if (!nuevaFecha) {
      alert("Por favor selecciona una fecha");
      return;
    }

    try {
      const resultado = await AuthLogin.actualizarCita({
        idCita: id,
        fechaCita: nuevaFecha,
      });

      if (resultado === "correcto") {
        alert("Fecha de cita actualizada correctamente");
        setCitas((prev) =>
          prev.map((cita) =>
            cita.id === id ? { ...cita, fecha: nuevaFecha, estado: "Asignada" } : cita
          )
        );
        setCitaEditando(null);
        setNuevaFecha("");
      } else {
        alert("No se pudo actualizar la cita. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      alert("Ocurrió un error al actualizar la cita");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Cargando Citas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
      {/* Datos del usuario */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-2">Citas Médicas</h2>
        <p className="text-gray-700">
          <span className="font-semibold">Nombre:</span> {nombre} <br />
          <span className="font-semibold">Especialidad:</span> {especialidad}
        </p>
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">
                  <input
                    type="text"
                    placeholder="Filtrar Paciente"
                    value={filtro.paciente}
                    onChange={(e) => setFiltro({ ...filtro, paciente: e.target.value })}
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  Nombre Paciente
                </th>
                <th className="border px-4 py-2">
                  <input
                    type="text"
                    placeholder="Filtrar Doctor"
                    value={filtro.doctor}
                    onChange={(e) => setFiltro({ ...filtro, doctor: e.target.value })}
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  Doctor Asignado
                </th>
                <th className="border px-4 py-2">
                  <input
                    type="text"
                    placeholder="Filtrar Fecha"
                    value={filtro.fecha}
                    onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })}
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  Fecha de Cita
                </th>
                <th className="border px-4 py-2">
                  <select
                    value={filtro.estado}
                    onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}
                    className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                  
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignada">Asignada</option>
                    <option value="Terminada">Terminada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                  Estado
                </th>
                {/* Solo mostrar columna Acciones si no es Paciente */}
                {especialidad !== "Paciente" && <th className="border px-4 py-2">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {CitasFiltradas.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{cita.paciente}</td>
                  <td className="border px-4 py-2">{cita.especialista}</td>
                  <td className="border px-4 py-2">{cita.fecha || "Sin fecha"}</td>
                  <td className="border px-4 py-2">
                    <span className={getEstadoStyle(cita.estado)}>{cita.estado}</span>
                  </td>
                  {/* Solo mostrar acciones si no es Paciente */}
                  {especialidad !== "Paciente" && (
                    <td className="border px-4 py-2 text-center">
                      {cita.estado.toLowerCase() === "pendiente" && (
                        citaEditando === cita.id ? (
                          <div className="flex flex-col items-center gap-2">
                            <input
                              type="date"
                              value={nuevaFecha}
                              onChange={(e) => setNuevaFecha(e.target.value)}
                              className="border border-gray-300 rounded-md p-1"
                            />
                            <button
                              onClick={() => handleGuardarFecha(cita.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Asignar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAsignarFecha(cita.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2 mx-auto hover:bg-blue-600"
                          >
                            <FaCalendarAlt /> Asignar fecha
                          </button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {CitasFiltradas.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No se encontraron Citas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
