"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { AuthLogin } from "@/app/services/login";

interface Accion {
  id: number;
  tipo: "Medicamento" | "Examen";
  nombre: string;
  cantidad: number;
  frecuencia?: string;
}

function CrearFichaContent() {
  const router = useRouter();
  const params = useSearchParams();

  // Datos del médico obtenidos desde la URL o sesión
  const nombreMedico = params.get("nombreMedico") || "Dr. Juan Pérez";
  const especialidadMedico = params.get("especialidad") || "Cardiología";

  // Datos del paciente obtenidos desde la URL
  const [dpiPaciente, setDpiPaciente] = useState("");
  const [nombrePaciente, setNombrePaciente] = useState("");

  // Observaciones del médico
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const dpi = params.get("dpi") || "";
    const nombre = params.get("nombrePaciente") || "";
    setDpiPaciente(dpi);
    setNombrePaciente(nombre);
  }, [params]);

  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [nuevaAccion, setNuevaAccion] = useState<Accion>({
    id: Date.now(),
    tipo: "Medicamento",
    nombre: "",
    cantidad: 1,
    frecuencia: "",
  });

  const handleAgregarAccion = () => {
    if (!nuevaAccion.nombre) return alert("Debe ingresar el nombre de la acción");
    setAcciones((prev) => [...prev, { ...nuevaAccion, id: Date.now() }]);
    setNuevaAccion({ id: Date.now(), tipo: "Medicamento", nombre: "", cantidad: 1, frecuencia: "" });
  };

  const handleEliminarAccion = (id: number) => {
    setAcciones((prev) => prev.filter((a) => a.id !== id));
  };

  const handleGuardarFicha = async () => {
    // Validaciones básicas
    if (!dpiPaciente || !nombrePaciente) return alert("Faltan datos del paciente");
    if (acciones.length === 0) return alert("Debe agregar al menos una acción");

    const ficha = {
      dpi: dpiPaciente,
      nombrePaciente,
      nombreMedico,
      especialidadMedico,
      observaciones, // agregado
      acciones: acciones.map(({ tipo, nombre, cantidad, frecuencia }) => ({
        tipo,
        nombre,
        cantidad,
        frecuencia: frecuencia?.trim() ? frecuencia : "1 Vez",
      })),
    };

    const resultado = await AuthLogin.insertarFicha(ficha);

    if (resultado.status === "correcto") {
      alert(`Ficha médica creada correctamente. ID: ${resultado.idFactura}`);
      router.push("./Pacientes");
    } else {
      alert("Error al crear ficha médica");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Botones superiores */}
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
        <p><strong>Nombre:</strong> {nombreMedico}</p>
        <p><strong>Especialidad:</strong> {especialidadMedico}</p>
      </div>

      {/* Datos del paciente */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Datos del Paciente</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">DPI</label>
            <input
              type="text"
              value={dpiPaciente}
              readOnly
              className="border rounded w-full p-2 bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Nombre del Paciente</label>
            <input
              type="text"
              value={nombrePaciente}
              readOnly
              className="border rounded w-full p-2 bg-gray-200 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Observaciones del Médico</h2>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Escriba aquí cualquier observación..."
          className="border rounded w-full p-2 h-24"
        />
      </div>

      {/* Acciones */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Acciones (Medicamentos / Exámenes)</h2>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <select
            value={nuevaAccion.tipo}
            onChange={(e) =>
              setNuevaAccion({ ...nuevaAccion, tipo: e.target.value as "Medicamento" | "Examen" })
            }
            className="border rounded p-2"
          >
            <option value="Medicamento">Medicamento</option>
            <option value="Examen">Examen</option>
          </select>

          <input
            type="text"
            placeholder="Nombre"
            value={nuevaAccion.nombre}
            onChange={(e) => setNuevaAccion({ ...nuevaAccion, nombre: e.target.value })}
            className="border rounded p-2"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={nuevaAccion.cantidad}
            onChange={(e) => setNuevaAccion({ ...nuevaAccion, cantidad: Number(e.target.value) })}
            className="border rounded p-2"
          />

          {nuevaAccion.tipo === "Medicamento" && (
            <input
              type="text"
              placeholder="Frecuencia"
              value={nuevaAccion.frecuencia}
              onChange={(e) => setNuevaAccion({ ...nuevaAccion, frecuencia: e.target.value })}
              className="border rounded p-2"
            />
          )}
        </div>

        <button
          onClick={handleAgregarAccion}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Agregar Acción
        </button>

        {/* Tabla de acciones */}
        <table className="min-w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">Nombre</th>
              <th className="border px-4 py-2">Cantidad</th>
              <th className="border px-4 py-2">Frecuencia</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {acciones.map((a) => (
              <tr key={a.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{a.tipo}</td>
                <td className="border px-4 py-2">{a.nombre}</td>
                <td className="border px-4 py-2">{a.cantidad}</td>
                <td className="border px-4 py-2">{a.frecuencia || "-"}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleEliminarAccion(a.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center mx-auto"
                  >
                    <FaTrash className="mr-2" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guardar */}
      <button
        onClick={handleGuardarFicha}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
      >
        Guardar Ficha Médica
      </button>
    </div>
  );
}

export default function CrearFichaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <CrearFichaContent />
    </Suspense>
  );
}
