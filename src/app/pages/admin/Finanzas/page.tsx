"use client";
import { useState, useEffect } from "react";
import { AuthLogin } from "@/app/services/login";

export default function PagosPage() {
  type Gasto = {
    id: number;
    tipo: string;
    monto: number;
    fecha: string;
  };
  type Ingreso = {
    id: number;
    tipo: string;
    monto: number;
    fecha: string;
  };
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setCargando(true);

      try {
        // Llamar a backend para obtener resumen de gastos
        const gastosRes = await AuthLogin.resumenGastosPorTipo();
        const ingresosRes = await AuthLogin.resumenPagosPorTipo();

        // Normalizar gastos
        setGastos(
          gastosRes.resumen.map((g: unknown, idx: number) => {
            const gasto = g as { TipoGasto: string; TotalGasto: string; FechaUltimoGasto: string };
            return {
              id: idx + 1,
              tipo: gasto.TipoGasto,
              monto: parseFloat(gasto.TotalGasto),
              fecha: gasto.FechaUltimoGasto.split("T")[0], // Solo fecha YYYY-MM-DD
            };
          })
        );

        // Normalizar ingresos
        setIngresos(
          ingresosRes.resumen.map((i: unknown, idx: number) => {
            const ingreso = i as { TipoGasto: string; TotalPagado: string; FechaUltimoPago: string };
            return {
              id: idx + 1,
              tipo: ingreso.TipoGasto,
              monto: parseFloat(ingreso.TotalPagado),
              fecha: ingreso.FechaUltimoPago.split("T")[0],
            };
          })
        );
      } catch (error) {
        console.error("Error al cargar datos de pagos y gastos:", error);
      }

      setCargando(false);
    };

    fetchDatos();
  }, []);

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const diferencia = totalIngresos - totalGastos;

  if (cargando) {
    return <p className="text-center mt-20 text-lg">Cargando datos...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8 space-y-12">

      {/* Tabla Gastos */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Gastos Actuales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Tipo de Gasto</th>
                <th className="border px-4 py-2">Monto</th>
                <th className="border px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{g.tipo}</td>
                  <td className="border px-4 py-2">Q{g.monto}</td>
                  <td className="border px-4 py-2">{g.fecha}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border px-4 py-2 text-right">Total Gastos:</td>
                <td className="border px-4 py-2">Q{totalGastos}</td>
                <td className="border px-4 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla Ingresos */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Ingresos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Tipo de Ingreso</th>
                <th className="border px-4 py-2">Monto</th>
                <th className="border px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.map((i) => (
                <tr key={i.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{i.tipo}</td>
                  <td className="border px-4 py-2">Q{i.monto}</td>
                  <td className="border px-4 py-2">{i.fecha}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border px-4 py-2 text-right">Total Ingresos:</td>
                <td className="border px-4 py-2">Q{totalIngresos}</td>
                <td className="border px-4 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen General */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Resumen General</h2>
        <div className="flex justify-center space-x-8 text-lg">
          <div>
            <p className="font-semibold text-green-600">Total Ingresos</p>
            <p>Q{totalIngresos}</p>
          </div>
          <div>
            <p className="font-semibold text-red-600">Total Gastos</p>
            <p>Q{totalGastos}</p>
          </div>
          <div>
            <p className="font-semibold text-blue-600">Diferencia</p>
            <p className={`${diferencia >= 0 ? "text-green-700" : "text-red-700"} font-bold`}>
              Q{diferencia}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
