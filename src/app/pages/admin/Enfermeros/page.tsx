"use client";
import { useEffect, useState, Suspense } from "react";
import { FaArrowLeft, FaUserNurse } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLogin } from "@/app/services/login";

interface Enfermero {
  id: number;
  nombre: string;
}

function AsignarEnfermeroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Datos del paciente desde query params ---
  const dpiPaciente = searchParams.get("dpi") || "";
  const nombrePaciente = searchParams.get("nombrePaciente") || "";

  // Datos del médico (desde localStorage)
  const [nombreMedico, setNombreMedico] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);

  // Enfermeros disponibles
  const [enfermeros, setEnfermeros] = useState<Enfermero[]>([]);

  // Estado de asignación
  const [idAsignacion, setIdAsignacion] = useState<number | null>(null);
  const [enfermeroSeleccionado, setEnfermeroSeleccionado] = useState<number | "">("");
  const [nombreEnfermeroAsignado, setNombreEnfermeroAsignado] = useState<string | null>(null);

  useEffect(() => {
    setNombreMedico(localStorage.getItem("nombre"));
    setEspecialidad(localStorage.getItem("especialidad"));

    const cargarEnfermeros = async () => {
      try {
        const { users } = await AuthLogin.listarEnfermeros();
        type EnfermeroRaw = {
          IdUsuario: number;
          Nombre: string;
        };
        const lista = users.map((u: unknown) => {
          const enfermero = u as EnfermeroRaw;
          return {
            id: enfermero.IdUsuario,
            nombre: enfermero.Nombre,
          };
        });
        setEnfermeros(lista);

        // Verificar asignación después de cargar enfermeros
        if (dpiPaciente) {
          const resp = await AuthLogin.verificarAsignacionEnfermero(dpiPaciente);
          if (resp.existe && resp.asignacion) {
            setIdAsignacion((resp.asignacion.IdAsignacion as number) ?? null);
            setNombreEnfermeroAsignado((resp.asignacion.NombreEnfermero as string) ?? null);

            const nombreAsignado = resp.asignacion.NombreEnfermero as string | undefined;
            const enf = nombreAsignado ? lista.find(e => e.nombre === nombreAsignado) : undefined;
            if (enf) setEnfermeroSeleccionado(enf.id);
          } else {
            setIdAsignacion(null);
            setNombreEnfermeroAsignado(null);
            setEnfermeroSeleccionado("");
          }
        }
      } catch (err) {
        console.error("Error al cargar enfermeros o verificar asignación:", err);
        setIdAsignacion(null);
        setNombreEnfermeroAsignado(null);
        setEnfermeroSeleccionado("");
      }
    };

    cargarEnfermeros();
  }, [dpiPaciente]);

  const handleAsignar = async () => {
    if (!enfermeroSeleccionado) {
      alert("Selecciona un enfermero antes de asignar");
      return;
    }

    const enfermero = enfermeros.find(e => e.id === enfermeroSeleccionado);
    if (!enfermero) return;

    try {
      if (idAsignacion) {
        // Actualizar
        const resp = await AuthLogin.actualizarEnfermeroAsignado({
          idAsignacion,
          nombreEnfermero: enfermero.nombre,
        });
        if (resp === "correcto") {
          setNombreEnfermeroAsignado(enfermero.nombre);
          alert("Enfermero actualizado correctamente ✅");
        } else {
          alert("Error al actualizar enfermero ❌");
        }
      } else {
        // Asignar nuevo
        const resp = await AuthLogin.asignarEnfermero({
          dpiPaciente,
          nombrePaciente,
          nombreEnfermero: enfermero.nombre,
        });
        if (resp.status === "correcto" && resp.idAsignacion) {
          setIdAsignacion(resp.idAsignacion);
          setNombreEnfermeroAsignado(enfermero.nombre);
          alert("Enfermero asignado correctamente ✅");
        } else {
          alert("Error al asignar enfermero ❌");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error al procesar la asignación ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Botón volver */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Regresar
        </button>
      </div>

      {/* Datos del médico */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Datos del Médico</h2>
        <p><strong>Nombre:</strong> {nombreMedico || "No disponible"}</p>
        <p><strong>Especialidad:</strong> {especialidad || "No disponible"}</p>
      </div>

      {/* Datos del paciente */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Datos del Paciente</h2>
        <p><strong>Nombre:</strong> {nombrePaciente || "No disponible"}</p>
        <p><strong>DPI:</strong> {dpiPaciente || "No disponible"}</p>
      </div>

      {/* Enfermero asignado (solo si existe) */}
      {idAsignacion && nombreEnfermeroAsignado && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Enfermero Asignado</h2>
          <p><strong>Nombre:</strong> {nombreEnfermeroAsignado}</p>
        </div>
      )}

      {/* Selección de enfermero */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Asignar Enfermero</h2>
        <div className="flex items-center gap-4">
          <select
            className="border rounded p-2 flex-1"
            value={enfermeroSeleccionado}
            onChange={(e) => setEnfermeroSeleccionado(Number(e.target.value))}
          >
            <option value="" disabled>Seleccionar un enfermero</option>
            {enfermeros.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          <button
            onClick={handleAsignar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <FaUserNurse className="mr-2" /> {idAsignacion ? "Actualizar" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AsignarEnfermeroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <AsignarEnfermeroContent />
    </Suspense>
  );
}
