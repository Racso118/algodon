"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaMoneyBillWave, FaArrowLeft } from "react-icons/fa";
import { AuthLogin } from "@/app/services/login";

interface Pago {
  idCobro: number;
  nombrePaciente: string;
  tipoGasto: string;
  nombreGasto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  dpi: string;
}

function PagePagosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pago, setPago] = useState<Pago | null>(null);

  useEffect(() => {
    // Extraer parámetros de la URL
    const idCobro = parseFloat(searchParams.get("id") || "0");
    const nombrePaciente = searchParams.get("nombrePaciente") || "";
    const tipoGasto = searchParams.get("tipoGasto") || "";
    const nombreGasto = searchParams.get("nombreGasto") || "";
    const cantidad = parseFloat(searchParams.get("cantidad") || "0");
    const precioUnitario = parseFloat(searchParams.get("precioUnitario") || "0");
    const total = parseFloat(searchParams.get("total") || "0");
    const dpi = searchParams.get("dpi") || "";

    const pagoTemp: Pago = {
      idCobro,
      nombrePaciente,
      tipoGasto,
      nombreGasto,
      cantidad,
      precioUnitario,
      total,
      dpi,
    };

    console.log("Datos recibidos en PagePagos:", pagoTemp); // <--- aquí ves todo en consola

    setPago(pagoTemp);
  }, [searchParams]);

  const handlePagar = async () => {
    if (!pago) return;

    try {
      const payload = {
        idCobro: pago.idCobro,
        DPIPaciente: pago.dpi,
        NombrePaciente: pago.nombrePaciente,
        TipoGasto: pago.tipoGasto,
        NombreGasto: pago.nombreGasto,
        Cantidad: pago.cantidad,
        PrecioUnitario: pago.precioUnitario
      };


      console.log("Payload para backend:", payload);

      const resultado = await AuthLogin.insertarPago(payload);

      if (resultado === "correcto") {
        alert(`Pago registrado correctamente para ${pago.nombrePaciente}`);
        router.back();
      } else {
        alert("Hubo un error al registrar el pago");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Ocurrió un error al procesar el pago");
    }
  };

  if (!pago) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Cargando detalle de pago...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
      {/* Botón Regresar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        <FaArrowLeft /> Regresar
      </button>

      {/* Formulario de detalle de pago */}
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Detalle de Pago</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col">
            No. Cobro
            <input
              type="text"
              value={pago.idCobro}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            DPI
            <input
              type="text"
              value={pago.dpi}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Paciente
            <input
              type="text"
              value={pago.nombrePaciente}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Tipo de Gasto
            <input
              type="text"
              value={pago.tipoGasto}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Nombre del Gasto
            <input
              type="text"
              value={pago.nombreGasto}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Cantidad
            <input
              type="text"
              value={pago.cantidad}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Precio Unitario
            <input
              type="text"
              value={`Q${pago.precioUnitario.toFixed(2)}`}
              readOnly
              className="border p-2 rounded-md bg-gray-100"
            />
          </label>
          <label className="flex flex-col">
            Total
            <input
              type="text"
              value={`Q${pago.total.toFixed(2)}`}
              readOnly
              className="border p-2 rounded-md bg-gray-100 font-semibold"
            />
          </label>

          {/* Botón Pagar */}
          <button
            onClick={handlePagar}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 justify-center hover:bg-green-700 mt-4"
          >
            <FaMoneyBillWave /> Pagar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PagePagos() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Cargando...</div>}>
      <PagePagosContent />
    </Suspense>
  );
}
