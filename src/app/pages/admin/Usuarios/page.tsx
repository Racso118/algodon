"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUserMd, FaUserNurse, FaCapsules, FaFlask, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { AuthLogin } from "@/app/services/login";

// Tipos
type Usuario = { id: number; nombre: string; dpi: string; rol: string; especialidad: string };
type Doctor = { id: number; nombre: string; dpi: string; rol: string; especialidad: string };
type Enfermero = { id: number; nombre: string; dpi: string; rol: string; especialidad: string };
type Farmacia = { id: number; nombre: string; dpi: string; rol: string; especialidad: string };
type Laboratorio = { id: number; nombre: string; dpi: string; rol: string; especialidad: string };

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Usuarios");

  const [filtro, setFiltro] = useState<{ [key: string]: string }>({});

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [medicos, setMedicos] = useState<Doctor[]>([]);
  const [enfermeros, setEnfermeros] = useState<Enfermero[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);

  const tabs = [
    { name: "Usuarios", icon: <FaUsers /> },
    { name: "Doctores", icon: <FaUserMd /> },
    { name: "Enfermeros", icon: <FaUserNurse /> },
    { name: "Farmacias", icon: <FaCapsules /> },
    { name: "Laboratorios", icon: <FaFlask /> },
  ];

  // --- Funciones de carga reutilizables ---
  const cargarUsuarios = async () => {
    try {
      const response = await AuthLogin.listarUsuarios();
      if (response.users && Array.isArray(response.users)) {
        type UsuarioRaw = { IdUsuario: number; Nombre: string; DPI: string; Rol: string; Especialidad: string };
        const formateados = response.users.map((u: unknown) => {
          const usuario = u as UsuarioRaw;
          return {
            id: usuario.IdUsuario,
            nombre: usuario.Nombre,
            dpi: usuario.DPI,
            rol: usuario.Rol,
            especialidad: usuario.Especialidad,
          };
        });
        setUsuarios(formateados);
      }
    } catch (error) { console.error("Error al cargar usuarios:", error); }
  };

  const cargarDoctores = async () => {
    try {
      const response = await AuthLogin.listarDoctores();
      if (response.users && Array.isArray(response.users)) {
        type DoctorRaw = { IdUsuario: number; Nombre: string; DPI: string; Rol: string; Especialidad: string };
        const formateados = response.users.map((d: unknown) => {
          const doctor = d as DoctorRaw;
          return {
            id: doctor.IdUsuario,
            nombre: doctor.Nombre,
            dpi: doctor.DPI,
            rol: doctor.Rol,
            especialidad: doctor.Especialidad,
          };
        });
        setMedicos(formateados);
      }
    } catch (error) { console.error("Error al cargar doctores:", error); }
  };

  const cargarEnfermeros = async () => {
    try {
      const response = await AuthLogin.listarEnfermeros();
      if (response.users && Array.isArray(response.users)) {
        type EnfermeroRaw = { IdUsuario: number; Nombre: string; DPI: string; Rol: string; Especialidad: string };
        const formateados = response.users.map((e: unknown) => {
          const enfermero = e as EnfermeroRaw;
          return {
            id: enfermero.IdUsuario,
            nombre: enfermero.Nombre,
            dpi: enfermero.DPI,
            rol: enfermero.Rol,
            especialidad: enfermero.Especialidad,
          };
        });
        setEnfermeros(formateados);
      }
    } catch (error) { console.error("Error al cargar enfermeros:", error); }
  };

  const cargarFarmacia = async () => {
    try {
      const response = await AuthLogin.listarFarmacia();
      if (response.users && Array.isArray(response.users)) {
        type FarmaciaRaw = { IdUsuario: number; Nombre: string; DPI: string; Rol: string; Especialidad: string };
        const formateados = response.users.map((f: unknown) => {
          const farmacia = f as FarmaciaRaw;
          return {
            id: farmacia.IdUsuario,
            nombre: farmacia.Nombre,
            dpi: farmacia.DPI,
            rol: farmacia.Rol,
            especialidad: farmacia.Especialidad,
          };
        });
        setFarmacias(formateados);
      }
    } catch (error) { console.error("Error al cargar farmacias:", error); }
  };

  const cargarLaboratorio = async () => {
    try {
      const response = await AuthLogin.listarLaboratorio();
      if (response.users && Array.isArray(response.users)) {
        type LaboratorioRaw = { IdUsuario: number; Nombre: string; DPI: string; Rol: string; Especialidad: string };
        const formateados = response.users.map((l: unknown) => {
          const laboratorio = l as LaboratorioRaw;
          return {
            id: laboratorio.IdUsuario,
            nombre: laboratorio.Nombre,
            dpi: laboratorio.DPI,
            rol: laboratorio.Rol,
            especialidad: laboratorio.Especialidad,
          };
        });
        setLaboratorios(formateados);
      }
    } catch (error) { console.error("Error al cargar laboratorios:", error); }
  };

  // --- Suspender usuario ---
  const suspenderUsuario = async (dpi: string) => {
    console.log("Datos a enviar para suspender usuario:", { dpi });
    const confirmacion = confirm("¿Seguro que quieres suspender este usuario?");
    if (!confirmacion) return;

    try {
      const resultado = await AuthLogin.suspenderUsuario({ dpi });
      console.log("Resultado suspensión:", resultado);

      if (resultado === "correcto") {
        alert("Usuario suspendido correctamente!");
        // Recargar lista según pestaña
        if (activeTab === "Usuarios") cargarUsuarios();
        else if (activeTab === "Doctores") cargarDoctores();
        else if (activeTab === "Enfermeros") cargarEnfermeros();
        else if (activeTab === "Farmacias") cargarFarmacia();
        else if (activeTab === "Laboratorios") cargarLaboratorio();
      } else {
        alert("Error al suspender usuario: " + resultado);
      }
    } catch (error) {
      const err = error as { response?: { data?: string }; message?: string };
      console.error("Error al suspender usuario:", err.response?.data || err.message || err);
      alert("Ocurrió un error al suspender el usuario.");
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    cargarUsuarios();
    cargarDoctores();
    cargarEnfermeros();
    cargarFarmacia();
    cargarLaboratorio();
  }, []);

  // --- Redirecciones ---
  const irACrear = () => router.push("/pages/admin/CrearUsuario");
  const irAEditar = (usuario: Usuario) => {
    const params = new URLSearchParams({ modo: "ver", dpi: usuario.dpi });
    router.push(`/pages/admin/CrearUsuario?${params.toString()}`);
  };

  // --- Preparar tabla según pestaña ---
  let data: Usuario[] = [];
  let headers: string[] = [];
  switch (activeTab) {
    case "Usuarios": data = usuarios; headers = ["Nombre", "DPI", "Rol", "Especialidad", "Acciones"]; break;
    case "Doctores": data = medicos; headers = ["Nombre", "DPI", "Rol", "Especialidad", "Acciones"]; break;
    case "Enfermeros": data = enfermeros; headers = ["Nombre", "DPI", "Rol", "Especialidad", "Acciones"]; break;
    case "Farmacias": data = farmacias; headers = ["Nombre", "DPI", "Rol", "Especialidad", "Acciones"]; break;
    case "Laboratorios": data = laboratorios; headers = ["Nombre", "DPI", "Rol", "Especialidad", "Acciones"]; break;
  }

  const dataFiltrada = data.filter(item =>
    headers.every(h => {
      const key = h.toLowerCase().replace(" ", "");
      let value: string | number | undefined;
      if (key === "nombre") value = item.nombre;
      else if (key === "dpi") value = item.dpi;
      else if (key === "rol") value = item.rol;
      else if (key === "especialidad") value = item.especialidad;
      else value = undefined;
      if (!filtro[key]) return true;
      return (value?.toString().toLowerCase() || "").includes(filtro[key].toLowerCase());
    })
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Pestañas */}
      <div className="flex space-x-4 mb-4 border-b">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => { setActiveTab(tab.name); setFiltro({}); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t ${activeTab === tab.name ? "bg-white font-bold border-t border-l border-r" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Botón Crear */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{activeTab}</h2>
        <button
          onClick={irACrear}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
        >
          <FaPlus /> Crear
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              {headers.map(h => {
                const key = h.toLowerCase().replace(" ", "");
                return (
                  <th key={h} className="border px-4 py-2">
                    {h !== "Acciones" && (
                      <input
                        type="text"
                        placeholder={`Filtrar ${h}`}
                        value={filtro[key] || ""}
                        onChange={e => setFiltro({ ...filtro, [key]: e.target.value })}
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
            {dataFiltrada.map(item => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{item.nombre}</td>
                <td className="border px-4 py-2">{item.dpi}</td>
                <td className="border px-4 py-2">{item.rol}</td>
                <td className="border px-4 py-2">{item.especialidad}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    onClick={() => irAEditar(item)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-yellow-500"
                  >
                    <FaEdit /> Editar
                  </button>

                  <button
                    onClick={() => suspenderUsuario(item.dpi)}
                    className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-600"
                  >
                    <FaTrash /> Eliminar
                  </button>

                  {/* ✅ Solo para Usuarios */}
                  {activeTab === "Usuarios" && (
                    <button
                      onClick={() => router.push(`/pages/admin/ListaFichasMedicas?dpi=${item.dpi}&nombre=${encodeURIComponent(item.nombre)}`)}
                      className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-600"
                    >
                      <FaUserMd /> Ver Fichas Médicas
                    </button>
                  )}

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
