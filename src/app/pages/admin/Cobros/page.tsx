"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLogin } from "@/app/services/login";
import { FaMoneyBillWave } from "react-icons/fa";

interface Gasto {
    id: number;
    dpi: string;
    nombrePaciente: string;
    tipoGasto: string;
    nombreGasto: string;
    precioUnitario: number;
    cantidad: number;
    totalGasto: number;
    fecha: string;
}

export default function VerCobrosPage() {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState({
        paciente: "",
        tipo: "",
        nombreGasto: "",
        fecha: "",
    });

    const [nombre, setNombre] = useState<string | null>(null);
    const [especialidad, setEspecialidad] = useState<string | null>(null);
    const [dpi, setDPI] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        setNombre(localStorage.getItem("nombre"));
        setEspecialidad(localStorage.getItem("especialidad"));
        setDPI(localStorage.getItem("dpi"));
    }, []);

    useEffect(() => {
        const fetchGastos = async () => {
            try {
                let resp;

                if (especialidad === "Paciente" && dpi) {
                    resp = await AuthLogin.listarDetalleGastosPorDPI(dpi);
                } else {
                    resp = await AuthLogin.listarDetalleGastos();
                }

                if (resp && Array.isArray(resp.gastos)) {
                    type GastoRaw = {
                        ID: number;
                        DPIPaciente: string;
                        NombrePaciente: string;
                        TipoGasto: string;
                        NombreGasto: string;
                        PrecioUnitario: string;
                        Cantidad: string;
                        TotalGasto: string;
                        Fecha?: string;
                    };
                    const dataFormateada: Gasto[] = resp.gastos.map((g: unknown) => {
                        const gasto = g as GastoRaw;
                        return {
                            id: gasto.ID,
                            dpi: gasto.DPIPaciente,
                            nombrePaciente: gasto.NombrePaciente,
                            tipoGasto: gasto.TipoGasto,
                            nombreGasto: gasto.NombreGasto,
                            precioUnitario: parseFloat(gasto.PrecioUnitario) || 0,
                            cantidad: parseFloat(gasto.Cantidad) || 0,
                            totalGasto: parseFloat(gasto.TotalGasto) || 0,
                            fecha: gasto.Fecha ? new Date(gasto.Fecha).toLocaleString() : "Sin fecha",
                        };
                    });
                    setGastos(dataFormateada);
                }
            } catch (error) {
                console.error("Error al obtener gastos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (nombre && especialidad) {
            fetchGastos();
        }
    }, [nombre, especialidad, dpi]);

    const gastosFiltrados = gastos.filter(
        (g) =>
            g.nombrePaciente.toLowerCase().includes(filtro.paciente.toLowerCase()) &&
            g.tipoGasto.toLowerCase().includes(filtro.tipo.toLowerCase()) &&
            g.nombreGasto.toLowerCase().includes(filtro.nombreGasto.toLowerCase()) &&
            g.fecha.toLowerCase().includes(filtro.fecha.toLowerCase())
    );

    const handlePagar = (gasto: Gasto) => {
        const params = new URLSearchParams({
            id: gasto.id.toString(),
            nombrePaciente: gasto.nombrePaciente,
            tipoGasto: gasto.tipoGasto,
            nombreGasto: gasto.nombreGasto,
            cantidad: gasto.cantidad.toString(),
            precioUnitario: gasto.precioUnitario.toString(),
            total: gasto.totalGasto.toString(),
            dpi: gasto.dpi,
        });

        router.push(`/pages/admin/Pagos?${params.toString()}`);
    };


    const totalGeneral = gastosFiltrados.reduce((acc, gasto) => acc + gasto.totalGasto, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
                Cargando cobros...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
            {/* Datos del usuario */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-xl font-bold mb-2">Pagos Pendientes</h2>
                <p className="text-gray-700">
                    <span className="font-semibold">Nombre:</span> {nombre} <br />
                    <span className="font-semibold">Rol / Especialidad:</span> {especialidad}
                </p>
            </div>

            {/* Tabla de cobros */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2">No. Cobro</th>
                                <th className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filtrar Paciente"
                                        value={filtro.paciente}
                                        onChange={(e) => setFiltro({ ...filtro, paciente: e.target.value })}
                                        className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    Paciente
                                </th>
                                <th className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filtrar Tipo"
                                        value={filtro.tipo}
                                        onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
                                        className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    Tipo de Gasto
                                </th>
                                <th className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filtrar Nombre"
                                        value={filtro.nombreGasto}
                                        onChange={(e) => setFiltro({ ...filtro, nombreGasto: e.target.value })}
                                        className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    Nombre del Gasto
                                </th>
                                <th className="border px-4 py-2">Cantidad</th>
                                <th className="border px-4 py-2">Precio Unitario</th>
                                <th className="border px-4 py-2">Total</th>
                                <th className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filtrar Fecha"
                                        value={filtro.fecha}
                                        onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })}
                                        className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    Fecha
                                </th>
                                <th className="border px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastosFiltrados.map((gasto) => (
                                <tr key={gasto.id} className="hover:bg-gray-100">
                                    <td className="border px-4 py-2">{gasto.id}</td>
                                    <td className="border px-4 py-2">{gasto.nombrePaciente}</td>
                                    <td className="border px-4 py-2">{gasto.tipoGasto}</td>
                                    <td className="border px-4 py-2">{gasto.nombreGasto}</td>
                                    <td className="border px-4 py-2 text-center">{gasto.cantidad}</td>
                                    <td className="border px-4 py-2 text-right">
                                        Q{gasto.precioUnitario.toFixed(2)}
                                    </td>
                                    <td className="border px-4 py-2 text-right font-semibold">
                                        Q{gasto.totalGasto.toFixed(2)}
                                    </td>
                                    <td className="border px-4 py-2">{gasto.fecha}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => handlePagar(gasto)}
                                            className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2 mx-auto hover:bg-green-700"
                                        >
                                            <FaMoneyBillWave /> Pagar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Fila de Total General */}
                            {gastosFiltrados.length > 0 && (
                                <tr className="bg-gray-200 font-bold">
                                    <td colSpan={6} className="border px-4 py-2 text-right">TOTAL GENERAL</td>
                                    <td className="border px-4 py-2 text-right">Q{totalGeneral.toFixed(2)}</td>
                                    <td className="border px-4 py-2"></td>
                                    <td className="border px-4 py-2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {gastosFiltrados.length === 0 && (
                        <p className="text-center text-gray-500 mt-4">No se encontraron cobros.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
