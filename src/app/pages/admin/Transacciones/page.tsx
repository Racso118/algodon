"use client";
import { useState, useEffect } from "react";
import { AuthLogin } from "@/app/services/login";

interface Pago {
    id: number;
    dpi: string;
    nombrePaciente: string;
    tipoPago: string;
    nombrePago: string;
    precioUnitario: number;
    cantidad: number;
    totalPago: number;
    fecha: string;
}

export default function VerPagosPage() {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState({
        paciente: "",
        tipo: "",
        nombrePago: "",
        fecha: "",
    });

    const [nombre, setNombre] = useState<string | null>(null);
    const [rol, setRol] = useState<string | null>(null);
    const [dpi, setDPI] = useState<string | null>(null);

    useEffect(() => {
        setNombre(localStorage.getItem("nombre"));
        setRol(localStorage.getItem("rol") || localStorage.getItem("especialidad"));
        setDPI(localStorage.getItem("dpi"));
    }, []);

    useEffect(() => {
        const fetchPagos = async () => {
            try {
                let resp;

                if (rol === "Paciente" && dpi) {
                    resp = await AuthLogin.listarPagosPorDPI(dpi);
                } else {
                    resp = await AuthLogin.listarPagos();
                }

                if (resp && Array.isArray(resp.pagos)) {
                    type PagoRaw = {
                        ID?: number;
                        id?: number;
                        DPIPaciente?: string;
                        dpi?: string;
                        NombrePaciente?: string;
                        nombrePaciente?: string;
                        TipoGasto?: string;
                        tipoPago?: string;
                        NombreGasto?: string;
                        nombrePago?: string;
                        PrecioUnitario?: string;
                        Cantidad?: string;
                        TotalGasto?: string;
                        Total?: string;
                        FechaPago?: string;
                    };
                    const dataFormateada: Pago[] = resp.pagos.map((p: unknown) => {
                        const pago = p as PagoRaw;
                        return {
                            id: pago.ID || pago.id || 0,
                            dpi: pago.DPIPaciente || pago.dpi || "",
                            nombrePaciente: pago.NombrePaciente || pago.nombrePaciente || "",
                            tipoPago: pago.TipoGasto || pago.tipoPago || "",
                            nombrePago: pago.NombreGasto || pago.nombrePago || "",
                            precioUnitario: parseFloat(pago.PrecioUnitario || "0"),
                            cantidad: parseFloat(pago.Cantidad || "0"),
                            totalPago: parseFloat(pago.TotalGasto || pago.Total || "0"),
                            fecha: pago.FechaPago ? new Date(pago.FechaPago).toLocaleString() : "Sin fecha",
                        };
                    });
                    setPagos(dataFormateada);
                }
            } catch (error) {
                console.error("Error al obtener pagos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (nombre && rol) fetchPagos();
    }, [nombre, rol, dpi]);

    const pagosFiltrados = pagos.filter(
        (p) =>
            p.nombrePaciente.toLowerCase().includes(filtro.paciente.toLowerCase()) &&
            p.tipoPago.toLowerCase().includes(filtro.tipo.toLowerCase()) &&
            p.nombrePago.toLowerCase().includes(filtro.nombrePago.toLowerCase()) &&
            p.fecha.toLowerCase().includes(filtro.fecha.toLowerCase())
    );

    const totalGeneral = pagosFiltrados.reduce((acc, pago) => acc + pago.totalPago, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
                Cargando pagos...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
            {/* Datos del usuario */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-2xl font-bold mb-2">Pagos Realizados</h2>
                <p className="text-gray-700">
                    <span className="font-semibold">Nombre:</span> {nombre} <br />
                    <span className="font-semibold">Rol / Especialidad:</span> {rol}
                </p>
            </div>

            {/* Tabla de pagos */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-200 uppercase text-gray-700">
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
                                    Tipo de Pago
                                </th>
                                <th className="border px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filtrar Nombre"
                                        value={filtro.nombrePago}
                                        onChange={(e) => setFiltro({ ...filtro, nombrePago: e.target.value })}
                                        className="w-full p-2 mb-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    Nombre del Pago
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
                            </tr>
                        </thead>
                        <tbody>
                            {pagosFiltrados.map((pago) => (
                                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="border px-4 py-2">{pago.nombrePaciente}</td>
                                    <td className="border px-4 py-2">{pago.tipoPago}</td>
                                    <td className="border px-4 py-2">{pago.nombrePago}</td>
                                    <td className="border px-4 py-2 text-center">{pago.cantidad}</td>
                                    <td className="border px-4 py-2 text-right">Q{pago.precioUnitario.toFixed(2)}</td>
                                    <td className="border px-4 py-2 text-right font-semibold">Q{pago.totalPago.toFixed(2)}</td>
                                    <td className="border px-4 py-2">{pago.fecha}</td>
                                </tr>
                            ))}

                            {/* Total general */}
                            {pagosFiltrados.length > 0 && (
                                <tr className="bg-gray-200 font-bold">
                                    <td colSpan={5} className="border px-4 py-2 text-right">TOTAL GENERAL</td>
                                    <td className="border px-4 py-2 text-right">Q{totalGeneral.toFixed(2)}</td>
                                    <td className="border px-4 py-2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {pagosFiltrados.length === 0 && (
                        <p className="text-center text-gray-500 mt-4">No se encontraron pagos.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
