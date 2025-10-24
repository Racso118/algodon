"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLogin } from "@/app/services/login";

export default function Recuperar() {
  const [usuario, setUsuario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim()) {
      setMensaje("Por favor ingresa tu DPI.");
      return;
    }

    try {
      // Llamamos a la función para resetear la contraseña
      const response = await AuthLogin.resetPassword(usuario);

      if (response === "correcto") {
        setMensaje(
          `Se ha enviado una nueva contraseña al correo registrado para el usuario "${usuario}".`
        );
      } else {
        setMensaje(`No se pudo enviar la recuperación para "${usuario}".`);
      }
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      setMensaje("Ocurrió un error. Intenta nuevamente más tarde.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Recuperación de contraseña</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="usuario">DPI</Label>
            <Input 
              id="usuario" 
              type="text" 
              placeholder="Ingresa tu DPI" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
            Recuperar
          </Button>
        </form>

        {mensaje && (
          <p className="mt-4 text-green-600 text-center">{mensaje}</p>
        )}
        <button
          onClick={() => router.push("../../")}
          className="mt-6 w-full bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition"
        >
          Regresar
        </button>
      </div>
    </div>
  );
}
