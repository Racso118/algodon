"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [especialidad, setEspecialidad] = useState<string | null>(null);
  const [dpi, setDPI] = useState<string | null>(null); // Nuevo estado

  useEffect(() => {
    setNombre(localStorage.getItem("nombre"));
    setEspecialidad(localStorage.getItem("especialidad"));
    setDPI(localStorage.getItem("dpi")); // Capturando DPI
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 p-6">
      {/* Sección de texto */}
      <div className="md:w-1/2 w-full bg-white p-8 rounded-2xl shadow-md mb-8 md:mb-0 md:mr-6">
        
        {/* Datos del usuario */}
        <div className="mb-6 text-center md:text-left">
          <p className="text-xl font-semibold text-gray-800">
            Nombre: {nombre || "No disponible"}
          </p>
          <p className="text-xl font-semibold text-gray-800">
            Especialidad: {especialidad || "No disponible"}
          </p>
          <p className="text-xl font-semibold text-gray-800">
            DPI: {dpi || "No disponible"} {/* Mostrando DPI debajo */}
          </p>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-10 text-center md:text-left">
          Asilo de Ancianos <br /> Cabeza de Algodón
        </h1>

        {/* Misión */}
        <h2 className="text-2xl font-bold text-blue-600 mb-3 text-center md:text-left">
          Misión
        </h2>
        <p className="text-gray-700 mb-6 text-justify">
          Brindar un hogar lleno de amor, respeto y cuidado integral a nuestros
          adultos mayores, promoviendo su bienestar físico, emocional y
          espiritual en un ambiente familiar donde se sientan valorados,
          escuchados y acompañados cada día.
        </p>

        {/* Visión */}
        <h2 className="text-2xl font-bold text-blue-600 mb-3 text-center md:text-left">
          Visión
        </h2>
        <p className="text-gray-700 mb-6 text-justify">
          Ser un referente de excelencia en el cuidado y atención de los adultos
          mayores, reconocidos por nuestra calidez humana, compromiso cristiano
          y servicio dedicado a quienes han entregado su vida con sabiduría y
          amor.
        </p>

        {/* Versículo */}
        <div className="mt-8 border-t pt-6 text-center md:text-left">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">
            Versículo Bíblico
          </h3>
          <p className="italic text-gray-600">
            “Delante de las canas te levantarás, y honrarás el rostro del
            anciano, y de tu Dios tendrás temor.” <br />
            <span className="font-semibold">— Levítico 19:32</span>
          </p>
        </div>
      </div>

      {/* Imagen al lado derecho */}
      <div className="md:w-1/2 w-full h-96 md:h-[650px] relative rounded-2xl overflow-hidden shadow-lg">
        <Image
          src="/bd.jpg"
          alt="Imagen del Asilo Cabeza de Algodón"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
