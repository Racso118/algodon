"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { AuthLogin } from "@/app/services/login";

interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
}

function CrearCitaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Datos del paciente desde query params ---
  const dpiPaciente = searchParams.get("dpi") || "";
  const nombrePaciente = searchParams.get("nombrePaciente") || "";

  // Datos del médico que está creando la cita (desde localStorage)
  const [nombreMedico, setNombreMedico] = useState<string | null>(null);
  const [especialidadMedico, setEspecialidadMedico] = useState<string | null>(null);

  // Datos de la cita
  const [razon, setRazon] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<number | "">("");

  // Médicos disponibles
  const [medicos, setMedicos] = useState<Medico[]>([]);

  // Especialidades disponibles (cargadas desde backend)
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  useEffect(() => {
    setNombreMedico(localStorage.getItem("nombre"));
    setEspecialidadMedico(localStorage.getItem("especialidad"));

    // Cargar médicos desde backend
    const cargarMedicos = async () => {
      try {
        const { users } = await AuthLogin.listarDoctores();
        type UsuarioRaw = {
          IdUsuario: number;
          Nombre: string;
          Especialidad: string;
        };
        const lista = users.map((u: unknown) => {
          const usuario = u as UsuarioRaw;
          return {
            id: usuario.IdUsuario,
            nombre: usuario.Nombre,
            especialidad: usuario.Especialidad,
          };
        });
        setMedicos(lista);
      } catch (err) {
        console.error("Error al cargar médicos:", err);
      }
    };

    // Cargar especialidades desde backend
    const cargarEspecialidades = async () => {
      try {
        const resp = await AuthLogin.listaEspecialidades();
        type CitaRaw = { Especialidad: string };
        const listaEsp = (resp.citas || []).map((c: unknown) => {
          const cita = c as CitaRaw;
          return cita.Especialidad;
        });
        setEspecialidades(listaEsp);
      } catch (err) {
        console.error("Error al cargar especialidades:", err);
      }
    };

    cargarMedicos();
    cargarEspecialidades();
  }, []);

  // Filtrar médicos por especialidad
  const medicosFiltrados = especialidad
    ? medicos.filter((m) => m.especialidad === especialidad)
    : medicos;

  const handleGuardarCita = async () => {
    if (!razon || !especialidad || !medicoSeleccionado) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Obtener el médico seleccionado de la lista filtrada
    const medico = medicos.find((m) => m.id === medicoSeleccionado);
    if (!medico) {
      alert("Médico no válido");
      return;
    }

    try {
      const resp = await AuthLogin.crearCita({
        dpiPaciente: dpiPaciente,
        nombrePaciente: nombrePaciente,
        doctorRefiere: nombreMedico || "Desconocido",
        nombreEspecialista: medico.nombre,
        especialidad: medico.especialidad,
        razon: razon,
      });

      if (resp.status === "correcto") {
        alert("Cita creada correctamente ✅");
        router.back();
      } else {
        alert("Error al crear cita ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear cita ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Regresar
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Datos del Médico</h2>
        <p><strong>Nombre:</strong> {nombreMedico || "No disponible"}</p>
        <p><strong>Especialidad:</strong> {especialidadMedico || "No disponible"}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Datos del Paciente</h2>
        <p><strong>Nombre:</strong> {nombrePaciente || "No disponible"}</p>
        <p><strong>DPI:</strong> {dpiPaciente || "No disponible"}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Crear Cita</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Razón de la cita</label>
            <input
              type="text"
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Motivo de la cita"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Especialidad</label>
            <select
              value={especialidad}
              onChange={(e) => {
                setEspecialidad(e.target.value);
                setMedicoSeleccionado("");
              }}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccionar especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Médico asignado</label>
            <select
              value={medicoSeleccionado}
              onChange={(e) => setMedicoSeleccionado(Number(e.target.value))}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccionar médico</option>
              {medicosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.especialidad})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGuardarCita}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <FaCalendarAlt /> Crear Cita
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrearCitaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CrearCitaContent />
    </Suspense>
  );
}
