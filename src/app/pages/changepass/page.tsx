"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { AuthLogin } from "@/app/services/login"; // importa tu clase con cambiarPasswordUsuario

export default function ChangePassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación de contraseñas
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Obtener DPI del usuario desde localStorage
    const dpi = typeof window !== 'undefined' ? localStorage.getItem('dpi') : null;
    if (!dpi) {
      setError('No se pudo obtener el DPI del usuario');
      return;
    }

    setLoading(true);
    const resultado = await AuthLogin.cambiarPasswordUsuario(dpi, newPassword);
    setLoading(false);

    if (resultado === 'correcto') {
      alert('Contraseña actualizada correctamente');
      router.push('/'); // Redirige al login
    } else {
      setError('Error al actualizar la contraseña');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <Image
        src="/login-image.jpg"
        alt="Fondo"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30"></div>

      <Card className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/80">
        <CardHeader className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Reiniciar Contraseña</h1>
          <p className="text-gray-600 mt-2 text-lg">Asilo de Ancianos - Cabeza de Algodón</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            {error && <p className="text-red-600 font-medium">{error}</p>}

            <div className="flex flex-col">
              <Label htmlFor="newPassword" className="text-gray-700 font-semibold mb-1">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold mb-1">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              className={`mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-xl transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            Regresar al login? <a href="/" className="text-blue-600 font-medium hover:underline">Iniciar Sesión</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
