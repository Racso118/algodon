"use client";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { AuthLogin } from "./services/login";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await AuthLogin.authenticate(email, password);
      console.log("response:", response);

      // Si la API devuelve statusPass = 'Reiniciar'
      if (response?.statusPass === 'Reiniciar') {
        router.push(`/pages/changepass`);
        return;
      }

      // Si login exitoso normal
      if (response?.status === "correcto") {
        router.push(
          `/pages/admin/?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );
      } else {
        console.error('Usuario o contraseña incorrectos');
        // Aquí podrías mostrar un mensaje al usuario
      }

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">

      {/* Nombre del Proyecto */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Asilo de Ancianos</h1>
        <p className="text-xl md:text-2xl text-gray-600 mt-2">Cabeza de Algodón</p>
      </div>

      {/* Card de Login */}
      <Card className="flex md:flex-row flex-col shadow-2xl w-full max-w-4xl rounded-xl overflow-hidden">
        {/* Imagen lateral */}
        <div className="md:w-1/2 w-full relative h-64 md:h-auto">
          <Image
            src="/login-image.jpg"
            alt="Login"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        {/* Formulario */}
        <CardContent className="md:w-1/2 w-full p-10 flex flex-col justify-center">
          <CardHeader className="mb-6 text-center md:text-left">
            <CardTitle className="text-3xl font-extrabold text-gray-800">Iniciar Sesión</CardTitle>
          </CardHeader>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <Label htmlFor="email" className="text-gray-700 font-semibold mb-1">DPI</Label>
              <Input
                id="email"
                type="email"
                placeholder="DPI del paciente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="password" className="text-gray-700 font-semibold mb-1">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              onClick={handleLogin}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all"
            >
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Cambio de contraseña? <a href="/pages/resetpasword" className="text-blue-600 font-medium hover:underline">Recuperar</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
