"use client";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import {
  FaUsers,
  FaChartBar,
  FaCalendarAlt,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaWallet,
  FaCoins 
} from "react-icons/fa";
interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Ruta {
  id: string; // id único para key
  title: string;
  url: string;
  rol: string;
  icon: JSX.Element;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);

  // Rutas base
  const rutasBase: Ruta[] = [
    { id: "finanzas", title: "Finanzas", url: "/pages/admin/Finanzas", rol: "Admin", icon: <FaMoneyBillWave className="inline mr-2" /> },
    { id: "usuarios", title: "Usuarios", url: "/pages/admin/Usuarios", rol: "Admin", icon: <FaUsers className="inline mr-2" /> },
    { id: "Citas", title: "Citas", url: "/pages/admin/Citas", rol: "Admin", icon: <FaCalendarAlt className="inline mr-2" /> },
    { id: "transacciones", title: "Transacciones", url: "/pages/admin/Transacciones", rol: "Admin", icon: <FaWallet className="inline mr-2" /> },
    { id: "asignado", title: "Informacion", url: "/pages/admin/EnfermerosAsignados", rol: "Enfermero", icon: <FaChartBar className="inline mr-2" /> },
    { id: "cobros", title: "Cobros", url: "/pages/admin/Cobros", rol: "Admin", icon: <FaCoins className="inline mr-2" /> },
    { id: "donaciones", title: "Donaciones", url: "/pages/admin/Donaciones", rol: "Admin", icon: <FaCoins className="inline mr-2" /> },
    { id: "Citas", title: "Citas", url: "/pages/admin/Citas", rol: "Paciente", icon: <FaUsers className="inline mr-2" /> },
    { id: "cobros", title: "Cobros", url: "/pages/admin/Cobros", rol: "Paciente", icon: <FaCoins className="inline mr-2" /> },
  ];

  useEffect(() => {
    const storedNombre = localStorage.getItem("nombre");
    const storedEspecialidad = localStorage.getItem("especialidad");
    const storedRol = localStorage.getItem("rol");

    setNombre(storedNombre);
    setEspecialidad(storedEspecialidad);
    setRol(storedRol);

    if (!storedNombre || !storedRol) {
      router.push("../../");
    }
  }, [router]);

  const handleLogout = () => {
    router.push("../../");
  };

  // Construir rutas dinámicas según rol y especialidad
  const rutasFiltradas: Ruta[] = [...rutasBase];

  if (rol === "Doctor") {
    if (especialidad === "General") {
      rutasFiltradas.push(
        {
          id: "reportes-pacientes",
          title: "Reportes",
          url: "/pages/admin/Pacientes",
          rol: "Doctor",
          icon: <FaUsers className="inline mr-2" />,
        }
      );
    } else {
      rutasFiltradas.push({
          id: "reportes-pacientes",
          title: "Reportes",
          url: "/pages/admin/Pacientes",
          rol: "Doctor",
          icon: <FaUsers className="inline mr-2" />,
        });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md h-screen fixed flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Acciones</h2>

          <nav className="flex flex-col gap-3">
            {rutasFiltradas
              .filter((ruta) => ruta.rol === rol)
              .map((ruta) => (
                <button
                  key={ruta.id}
                  onClick={() => router.push(ruta.url)}
                  className="text-left hover:text-blue-500 flex items-center px-2 py-2 rounded hover:bg-gray-100 transition"
                >
                  {ruta.icon}
                  {ruta.title}
                </button>
              ))}
          </nav>
        </div>

        {/* Usuario y Cerrar sesión */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-gray-600 mb-2">{nombre}</p>
          <p className="text-gray-400 text-sm mb-4">{especialidad}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
