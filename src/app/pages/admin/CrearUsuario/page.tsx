"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaIdCard,
  FaUser,
  FaUserCircle,
  FaUserMd,
  FaEnvelope,
  FaBirthdayCake,
  FaHome,
  FaLock,
} from "react-icons/fa";
import { AuthLogin } from "@/app/services/login";

type Rol = "Paciente" | "Doctor" | "Enfermero" | "Laboratorio";

type FormData = {
  dpi: string;
  nombre: string;
  rol: Rol;
  especialidad: string;
  correoUsuario: string;
  correoFamiliar: string;
  edad: number;
  fechaRegistro: string;
  contrasena?: string; // nuevo campo opcional
};

function CrearUsuarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rutaRegreso = "./Usuarios";

  const modo = searchParams.get("modo"); // "ver" = editar, otro = agregar
  const dpiParam = searchParams.get("dpi");

  const [form, setForm] = useState<FormData>({
    dpi: "",
    nombre: "",
    rol: "Paciente",
    especialidad: "Paciente",
    correoUsuario: "",
    correoFamiliar: "",
    edad: 0,
    fechaRegistro: new Date().toISOString(),
    contrasena: "", // inicializamos vacío
  });

  const [bloqueado, setBloqueado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const especialidadesDoctor = [
    "Cardiologo",
    "Traumatologo",
    "Neumologo",
    "Oncologo",
    "Oftalmologo",
    "General",
  ];

  // Cargar datos si estamos en modo "ver"
  useEffect(() => {
    const cargarUsuario = async () => {
      if (modo === "ver" && dpiParam) {
        setCargando(true);
        try {
          const usuario = await AuthLogin.obtenerUsuarioPorDPI(dpiParam);
          if (usuario) {
            setForm({
              dpi: (usuario.DPI as string) || "",
              nombre: (usuario.Nombre as string) || "",
              rol: (usuario.Rol as Rol) || "Paciente",
              especialidad: (usuario.Especialidad as string) || "",
              correoUsuario: (usuario.CorreoUsuario as string) || "",
              correoFamiliar: (usuario.CorreoFamiliar as string) || "",
              edad: (usuario.Edad as number) || 0,
              fechaRegistro: (usuario.FechaRegistro as string) || new Date().toISOString(),
            });
          } else {
            alert("No se encontró el usuario con ese DPI.");
            router.push(rutaRegreso);
          }
        } catch (error) {
          console.error("Error cargando usuario:", error);
          alert("Error al obtener datos del usuario.");
        } finally {
          setCargando(false);
        }
      }
    };
    cargarUsuario();
  }, [modo, dpiParam, router]);

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      if (name === "rol") {
        setForm((prev) => ({
          ...prev,
          rol: value as Rol,
          especialidad: value === "Doctor" ? "" : value,
        }));
      } else if (name === "edad") {
        setForm((prev) => ({ ...prev, [name]: Number(value) }));
      } else {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setCargando(true);

    try {
      // Creamos un objeto con los datos a enviar como JSON
      const dataToSend = { 
        ...form, 
        fechaRegistro: new Date().toISOString() 
      };

      console.log("Datos a enviar:", dataToSend); // Para depuración

      if (modo === "ver") {
        // Actualizar usuario
        const resultado = await AuthLogin.actualizarUsuario(dataToSend);
        console.log("Resultado del backend:", resultado);
        if (resultado === "correcto") {
          alert("Usuario actualizado correctamente!");
          router.push(rutaRegreso);
        } else {
          alert("Error al actualizar usuario: " + resultado);
        }
      } else {
        // Crear usuario
        if (!form.contrasena) {
          alert("La contraseña es obligatoria");
          setCargando(false);
          return;
        }

        const resultado = await AuthLogin.insertarUsuario(dataToSend);
        console.log("Resultado del backend:", resultado);
        if (resultado === "correcto") {
          alert("Usuario registrado correctamente!");
          router.push(rutaRegreso);
        } else {
          alert("Error al registrar usuario: " + resultado);
        }
      }

    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: dynamic access
        console.error("Error en la operación:", error.response?.data || error.message || error);
        alert("Ocurrió un error. Revisa la consola.");
      } else {
        console.error("Error en la operación:", error);
        alert("Ocurrió un error. Revisa la consola.");
      }
    } finally {
      setCargando(false);
    }
  };


  const handleRegresar = () => router.push(rutaRegreso);

  if (cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg font-semibold text-blue-600">
        Cargando datos del usuario...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-blue-200"
      >
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Asilo de Ancianos</h1>
          <p className="text-lg text-gray-600 font-semibold">Cabeza de Algodón</p>
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center justify-center">
          <FaUserCircle className="mr-2 text-blue-600" />
          {modo === "ver" ? "Editar Usuario" : "Registrar Usuario"}
        </h2>

        <div className="space-y-3">
          <Campo icon={<FaIdCard />} label="DPI" name="dpi" value={form.dpi} onChange={handleChange} readOnly={modo === "ver"} />
          <Campo icon={<FaUser />} label="Nombre Completo" name="nombre" value={form.nombre} onChange={handleChange} />
          
          {/* Rol */}
          <div>
            <label className="text-sm font-medium text-gray-600">Rol</label>
            <div className="flex items-center border rounded-lg p-2 mt-1">
              <FaUserMd className="text-gray-500 mr-2" />
              <select name="rol" value={form.rol} onChange={handleChange} className="w-full bg-transparent outline-none">
                <option value="Paciente">Paciente</option>
                <option value="Doctor">Doctor</option>
                <option value="Enfermero">Enfermero</option>
                <option value="Laboratorio">Laboratorio</option>
              </select>
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label className="text-sm font-medium text-gray-600">Especialidad</label>
            <div className="flex items-center border rounded-lg p-2 mt-1">
              <FaHome className="text-gray-500 mr-2" />
              {form.rol === "Doctor" ? (
                <select
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidadesDoctor.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="especialidad" value={form.especialidad} readOnly className="w-full bg-transparent outline-none" />
              )}
            </div>
          </div>

          <Campo icon={<FaEnvelope />} label="Correo del Usuario" name="correoUsuario" type="email" value={form.correoUsuario} onChange={handleChange} />
          <Campo icon={<FaEnvelope />} label="Correo del Familiar" name="correoFamiliar" type="email" value={form.correoFamiliar} onChange={handleChange} />
          <Campo icon={<FaBirthdayCake />} label="Edad" name="edad" type="number" value={form.edad.toString()} onChange={handleChange} />

          {/* Contraseña solo en crear */}
          {modo !== "ver" && (
            <Campo icon={<FaLock />} label="Contraseña" name="contrasena" type="password" value={form.contrasena || ""} onChange={handleChange} />
          )}
        </div>

        {/* Botones */}
        <div className="mt-6 space-y-2">
          <button type="submit" className="w-full py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700">
            {modo === "ver" ? "Actualizar" : "Registrar"}
          </button>
          <button type="button" onClick={handleRegresar} className="w-full py-2 text-white font-semibold rounded-lg bg-red-500 hover:bg-red-600">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CrearUsuario() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <CrearUsuarioContent />
    </Suspense>
  );
}

// Campo reutilizable
function Campo({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-center border rounded-lg p-2 mt-1">
        <span className="text-gray-500 mr-2">{icon}</span>
        <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly} className="w-full bg-transparent outline-none" required />
      </div>
    </div>
  );
}
