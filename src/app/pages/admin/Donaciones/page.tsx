"use client";
import { useState, useEffect } from "react";
import { AuthLogin } from "@/app/services/login";

export default function DonacionesPage() {
    const [nombrePaciente, setNombrePaciente] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState<number | "">("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const [nombre, setNombre] = useState<string | null>(null);
    const [rol, setRol] = useState<string | null>(null);

    useEffect(() => {
        setNombre(localStorage.getItem("nombre"));
        setRol(localStorage.getItem("rol") || localStorage.getItem("especialidad"));
    }, []);

    const handleInsertarDonacion = async () => {
        if (!nombrePaciente || precioUnitario === "") {
            setMensaje("Por favor, completa todos los campos.");
            return;
        }

        setLoading(true);
        setMensaje(null);

        const data = {
            idCobro: 0,
            DPIPaciente: "00000000",  // DPI del usuario especial Donaciones
            NombrePaciente: nombrePaciente,  // Nombre real del donante
            TipoGasto: "Donacion",
            NombreGasto: "Donacion",
            Cantidad: 1,
            PrecioUnitario: Number(precioUnitario),
        };


        const resultado = await AuthLogin.insertarPago(data);

        if (resultado === "correcto") {
            setMensaje("Donación registrada correctamente.");
            setNombrePaciente("");
            setPrecioUnitario("");
        } else {
            setMensaje("Error al registrar la donación.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
            <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Registrar Donación</h2>

                <p className="text-gray-700 mb-4">
                    <span className="font-semibold">Usuario:</span> {nombre} <br />
                    <span className="font-semibold">Rol / Especialidad:</span> {rol}
                </p>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Nombre del Donante</label>
                    <input
                        type="text"
                        value={nombrePaciente}
                        onChange={(e) => setNombrePaciente(e.target.value)}
                        className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Nombre del donante"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Monto de la Donación (Q)</label>
                    <input
                        type="number"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Monto en quetzales"
                        min={0}
                    />
                </div>

                {mensaje && <p className="mb-4 text-center text-gray-700">{mensaje}</p>}

                <button
                    onClick={handleInsertarDonacion}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? "Registrando..." : "Registrar Donación"}
                </button>
            </div>
        </div>
    );
}
