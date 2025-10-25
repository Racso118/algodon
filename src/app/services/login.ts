import axios from 'axios';
export interface FichaMedica {
    IdAccion: number;
    DPIPaciente: string;
    NombrePaciente: string;
    NombreMedico: string;
    EspecialidadMedico: string;
    Medicamento: string;
    Cantidad: number;
    Frecuencia: string;
    StatusAccion: string;
}
export interface FichaUsuario {
    IdFactura: number;
    DPIPaciente: string;
    NombrePaciente: string;
    EspecialidadMedico: string;
    Doctor: string;
    Fecha: string;
}
export interface DetalleFichaMedica {
    IdFactura: number;
    DPIPaciente: string;
    NombrePaciente: string;
    NombreMedico: string;
    EspecialidadMedico: string;
    Fecha: string;
    Observaciones: string | null;
    IdAccion: number | null;
    TipoAccion: string | null;
    NombreAccion: string | null;
    Cantidad: number | null;
    StatusAccion: string | null;
    Frecuencia: string | null;
}
export interface EnfermeroAsignado {
    IdAsignacion: number;
    DPIPaciente: string;
    NombrePaciente: string;
    NombreEnfermero: string;
    FechaAsignacion: string;
}
export class AuthLogin {

    // Selects de datos
    static async authenticate(DPI: string, Password: string): Promise<{ status: string, statusPass?: string, user?: any }> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users`, {
                DPI,
                Password
            });

            console.log('Respuesta completa:', response.data);

            if (response.status !== 200 || !response.data.user) {
                return { status: 'fallo' };
            }

            const user = response.data.user;

            // Guardar en localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('dpi', user.dpi || '');
                localStorage.setItem('nombre', user.nombre || '');
                localStorage.setItem('rol', user.rol || '');
                localStorage.setItem('especialidad', user.especialidad || '');
            }

            // Usar el statusPass que viene del backend
            return { status: 'correcto', statusPass: response.data.statusPass, user };

        } catch (error) {
            console.error('Error en authenticate:', error);
            return { status: 'fallo' };
        }
    }
    static async listarUsuarios(): Promise<{ message: string; users: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/pacientes`);
            if (response.status === 200 && Array.isArray(response.data.users)) {
                const users = response.data.users.map((u: Record<string, unknown>) => u);
                return { message: response.data.message || "", users };
            }
            return { message: "", users: [] };
        } catch (error) {
            console.error("Error al listar usuarios:", error);
            return { message: "", users: [] };
        }
    }
    static async listarDoctores(): Promise<{ message: string; users: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/doctores`);
            if (response.status === 200 && Array.isArray(response.data.users)) {
                const users = response.data.users.map((u: Record<string, unknown>) => u);
                return { message: response.data.message || "", users };
            }
            return { message: "", users: [] };
        } catch (error) {
            console.error("Error al listar doctores:", error);
            return { message: "", users: [] };
        }
    }
    static async listarEnfermeros(): Promise<{ message: string; users: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/enfermeros`);
            return response.status === 200 ? response.data : { message: "", users: [] };
        } catch (error) {
            console.error("Error al listar enfermeros:", error);
            return { message: "", users: [] };
        }
    }
    static async listarFarmacia(): Promise<{ message: string; users: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/farmacia`);
            return response.status === 200 ? response.data : { message: "", users: [] };
        } catch (error) {
            console.error("Error al listar farmacia:", error);
            return { message: "", users: [] };
        }
    }
    static async listarLaboratorio(): Promise<{ message: string; users: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/laboratorio`);
            return response.status === 200 ? response.data : { message: "", users: [] };
        } catch (error) {
            console.error("Error al listar laboratorio:", error);
            return { message: "", users: [] };
        }
    }
    static async obtenerUsuarioPorDPI(DPI: string): Promise<Record<string, unknown> | null> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/datos`, { DPI });
            if (response.status === 200 && response.data.users && response.data.users.length > 0) {
                return response.data.users[0] as Record<string, unknown>;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error al obtener usuario por DPI:", error);
            return null;
        }
    }
    static async ListaMedicamentos(DPI: string): Promise<FichaMedica[]> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/medicamentos`,
                { DPI }
            );

            // Asegurarse de que fichas sea un array
            const fichas = Array.isArray(response.data?.fichas) ? response.data.fichas : [];

            return fichas.map((f: Record<string, unknown>) => ({
                IdAccion: f.IdAccion ?? 0,
                DPIPaciente: f.DPIPaciente ?? "",
                NombrePaciente: f.NombrePaciente ?? "",
                NombreMedico: f.NombreMedico ?? "",
                EspecialidadMedico: f.EspecialidadMedico ?? "",
                Medicamento: f.Medicamento ?? "No asignado",
                Cantidad: f.Cantidad ?? 0,
                Frecuencia: f.Frecuencia ?? "",
                StatusAccion: f.StatusAccion ?? ""
            }));
        } catch (error) {
            const err = error as { response?: { status?: number }; message?: string };
            if (err.response?.status === 404) {
                console.warn(`No se encontraron medicamentos para DPI ${DPI}`);
                return [];
            }
            console.error("Error al obtener medicamentos por DPI:", err);
            return [];
        }
    }
    static async verificarAsignacionEnfermero(DPI: string): Promise<{ existe: boolean; asignacion?: Record<string, unknown> }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/asignacionenfermero`, // ruta que apunte a obtenerAsignacionPorDPI
                { DPI }
            );

            if (response.status === 200 && response.data.asignacion) {
                return { existe: true, asignacion: response.data.asignacion as Record<string, unknown> };
            } else {
                return { existe: false };
            }
        } catch (error) {
            const err = error as { response?: { status?: number }; message?: string };
            if (err.response && err.response.status === 404) {
                // No hay asignación
                return { existe: false };
            }
            console.error("Error al verificar asignación de enfermero:", err);
            return { existe: false };
        }
    }
    static async listarCitas(): Promise<{ message: string; Citas: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/Citas`);
            return response.status === 200 ? response.data : { message: "", Citas: [] };
        } catch (error) {
            console.error("Error al listar Citas:", error);
            return { message: "", Citas: [] };
        }
    }
    static async listarCitasPorDPI(DPI: string): Promise<{ message: string; Citas: unknown[] }> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/Citasusuario`, { DPI });

            // Validamos que response.data tenga la propiedad Citas y sea un array
            const Citas = Array.isArray(response.data?.Citas) ? response.data.Citas : [];

            return {
                message: response.data?.message || "",
                Citas,
            };
        } catch (error) {
            console.error("Error al listar Citas por DPI:", error);
            return { message: "", Citas: [] }; // Siempre devolvemos un array aunque falle
        }
    }
    static async listaEspecialidades(): Promise<{ message: string; Citas: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/especialidades`);
            return response.status === 200 ? response.data : { message: "", Citas: [] };
        } catch (error) {
            console.error("Error al listar especialidades:", error);
            return { message: "", Citas: [] };
        }
    }
    static async ListaFichasUsuario(DPI: string): Promise<FichaUsuario[]> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/fichasusuario`,
                { dpi: DPI } // coincide con lo que espera tu endpoint
            );

            // Asegurarse de que fichas sea un array
            const fichas = Array.isArray(response.data?.fichas) ? response.data.fichas : [];

            return fichas.map((f: FichaUsuario) => ({
                IdFactura: f.IdFactura ?? 0,
                DPIPaciente: f.DPIPaciente ?? "",
                NombrePaciente: f.NombrePaciente ?? "",
                EspecialidadMedico: f.EspecialidadMedico ?? "",
                Doctor: f.Doctor ?? "",
                Fecha: f.Fecha ?? ""
            }));
        } catch (error) {
            const err = error as { message?: string };
            console.error("Error al obtener fichas por DPI:", err.message || error);
            return [];
        }
    }
    static async obtenerDetalleFicha(IdFactura: number): Promise<DetalleFichaMedica[]> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/detalleficha`,
                { IdFactura }
            );

            const detalle = Array.isArray(response.data?.detalle) ? response.data.detalle : [];

            return detalle.map((f: DetalleFichaMedica) => ({
                IdFactura: f.IdFactura ?? 0,
                DPIPaciente: f.DPIPaciente ?? "",
                NombrePaciente: f.NombrePaciente ?? "",
                NombreMedico: f.NombreMedico ?? "",
                EspecialidadMedico: f.EspecialidadMedico ?? "",
                Fecha: f.Fecha ?? "",
                Observaciones: f.Observaciones ?? null,
                IdAccion: f.IdAccion ?? null,
                TipoAccion: f.TipoAccion ?? null,
                NombreAccion: f.NombreAccion ?? null,
                Cantidad: f.Cantidad ?? null,
                StatusAccion: f.StatusAccion ?? null,
                Frecuencia: f.Frecuencia ?? null
            }));
        } catch (error) {
            console.error("Error al obtener detalle de ficha médica:", error);
            return [];
        }
    }
    static async listarEnfermeroAsignado(nombreEnfermero: string): Promise<{ message: string; asignaciones: EnfermeroAsignado[] }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/enfermeroasignado`,
                { nombreEnfermero } // <-- enviamos el nombre al backend
            );

            if (response.status === 200) {
                // Asegurarse de que asignaciones sea un array
                const asignacionesRaw = Array.isArray(response.data?.asignaciones) ? response.data.asignaciones as Record<string, unknown>[] : [];
                const asignaciones: EnfermeroAsignado[] = asignacionesRaw.map(a => ({
                    IdAsignacion: a.IdAsignacion as number,
                    DPIPaciente: a.DPIPaciente as string,
                    NombrePaciente: a.NombrePaciente as string,
                    NombreEnfermero: a.NombreEnfermero as string,
                    FechaAsignacion: a.FechaAsignacion as string
                }));
                return {
                    message: response.data.message || "Asignaciones obtenidas correctamente",
                    asignaciones
                };
            } else {
                return { message: "", asignaciones: [] };
            }
        } catch (error) {
            console.error("Error al listar enfermero asignado:", error);
            return { message: "", asignaciones: [] };
        }
    }
    static async listarCitasPorDoctor(NombreDoctor: string): Promise<{ message: string; Citas: unknown[] }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/Citasdoctor`,
                { NombreDoctor } // enviamos el nombre al backend
            );

            if (response.status === 200) {
                // Asegurarse de que Citas sea un array
                const Citas = Array.isArray(response.data?.Citas) ? response.data.Citas as Record<string, unknown>[] : [];
                return {
                    message: response.data.message || "Citas obtenidas correctamente",
                    Citas
                };
            } else {
                return { message: "", Citas: [] };
            }
        } catch (error) {
            // Manejar específicamente 404 (no tiene Citas asignadas)
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            if (err.response?.status === 404) {
                console.warn(`No se encontraron Citas para el doctor ${NombreDoctor}`);
                return { message: err.response.data?.message || "No hay Citas", Citas: [] };
            }

            console.error("Error al listar Citas por doctor:", error);
            return { message: "", Citas: [] };
        }
    }
    static async listarDetalleGastos(): Promise<{ message: string; gastos: unknown[] }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/detallegastos`
            );

            const gastos = Array.isArray(response.data?.gastos) ? response.data.gastos.map((g: Record<string, unknown>) => g) : [];
            return {
                message: response.data?.message || "Gastos obtenidos correctamente",
                gastos
            };
        } catch (error) {
            console.error("Error al obtener detalle de gastos:", error);
            return { message: "Error al obtener detalle de gastos", gastos: [] };
        }
    }
    static async listarDetalleGastosPorDPI(DPI: string): Promise<{ message: string; gastos: unknown[] }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/detallegastosusuario`,
                { DPI }
            );

            const gastos = Array.isArray(response.data?.gastos) ? response.data.gastos.map((g: Record<string, unknown>) => g) : [];
            return {
                message: response.data?.message || "Gastos por paciente obtenidos correctamente",
                gastos
            };
        } catch (error) {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 404) {
                console.warn(`No se encontraron gastos para DPI ${DPI}`);
                return { message: "No se encontraron gastos", gastos: [] };
            }

            console.error("Error al obtener detalle de gastos por DPI:", error);
            return { message: "Error al obtener detalle de gastos", gastos: [] };
        }
    }
    static async listarPagos(): Promise<{ message: string; pagos: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/pagos`);

            const pagos = Array.isArray(response.data?.pagos) ? response.data.pagos : [];

            return {
                message: response.data?.message || "Pagos obtenidos correctamente",
                pagos
            };
        } catch (error) {
            console.error("Error al listar pagos:", error);
            return { message: "Error al obtener pagos", pagos: [] };
        }
    }
    static async listarPagosPorDPI(DPI: string): Promise<{ message: string; pagos: unknown[] }> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/pagosusuario`, { DPI });

            const pagos = Array.isArray(response.data?.pagos) ? response.data.pagos : [];

            return {
                message: response.data?.message || `Pagos para DPI ${DPI} obtenidos correctamente`,
                pagos
            };
        } catch (error) {
            console.error(`Error al listar pagos por DPI ${DPI}:`, error);
            return { message: `Error al obtener pagos para DPI ${DPI}`, pagos: [] };
        }
    }
    static async resumenPagosPorTipo(): Promise<{ message: string; resumen: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/resumenpagostipo`);
            const resumen = Array.isArray(response.data?.resumen) ? response.data.resumen : [];
            return {
                message: response.data?.message || "Resumen de pagos obtenido correctamente",
                resumen
            };
        } catch (error) {
            console.error("Error al obtener resumen de pagos por tipo:", error);
            return { message: "Error al obtener resumen de pagos", resumen: [] };
        }
    }
    static async resumenGastosPorTipo(): Promise<{ message: string; resumen: unknown[] }> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/resumengastostipo`);
            const resumen = Array.isArray(response.data?.resumen) ? response.data.resumen : [];
            return {
                message: response.data?.message || "Resumen de gastos obtenido correctamente",
                resumen
            };
        } catch (error) {
            console.error("Error al obtener resumen de gastos por tipo:", error);
            return { message: "Error al obtener resumen de gastos", resumen: [] };
        }
    }

    // Insertar datos
    static async insertarUsuario(data: Record<string, unknown>): Promise<string> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/agregar`, data);
            if (response.status === 201) {
                return "correcto";
            } else {
                return "fallo";
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            return "fallo";
        }
    }
    static async insertarFicha(ficha: Record<string, unknown>): Promise<{ status: string; idFactura?: number }> {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/cita`, ficha);

            if (response.status === 201) {
                return { status: "correcto", idFactura: response.data.idFactura };
            } else {
                return { status: "fallo" };
            }
        } catch (error) {
            console.error("Error al insertar ficha médica:", error);
            return { status: "fallo" };
        }
    }
    static async asignarEnfermero(data: { dpiPaciente: string; nombrePaciente: string; nombreEnfermero: string }): Promise<{ status: string; idAsignacion?: number }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/asignarenfermero`,
                data
            );

            if (response.status === 201) {
                return { status: "correcto", idAsignacion: response.data.asignacionId };
            } else {
                return { status: "fallo" };
            }
        } catch (error) {
            console.error("Error al asignar enfermero:", error);
            return { status: "fallo" };
        }
    }
    static async crearCita(data: {
        dpiPaciente: string;
        nombrePaciente: string;
        doctorRefiere: string;
        nombreEspecialista: string;
        especialidad: string;
        razon: string;
    }): Promise<{ status: string; idCita?: number }> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/crearcita`,
                data
            );
            if (response.status === 201) {
                return { status: "correcto", idCita: response.data.idCita };
            } else {
                return { status: "fallo" };
            }
        } catch (error) {
            console.error("Error al crear cita:", error);
            return { status: "fallo" };
        }
    }
    static async insertarPago(data: {
        idCobro: number;
        DPIPaciente: string;
        NombrePaciente: string;
        TipoGasto: string;
        NombreGasto: string;
        Cantidad: number;
        PrecioUnitario: number;
    }): Promise<"correcto" | "fallo"> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/pagogasto`,
                data
            );
            return response.status === 201 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al insertar pago:", error);
            return "fallo";
        }
    }// AuthLogin
    static async resetPassword(DPI: string): Promise<"correcto" | "fallo"> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/resetpassword`,
                { DPI }
            );
            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error en resetPassword:", error);
            return "fallo";
        }
    }


    // Actualizar datos
    static async actualizarUsuario(data: Record<string, unknown>): Promise<string> {
        try {
            console.log("Datos para actualizar:", data);
            const response = await axios.put(`${process.env.NEXT_PUBLIC_BK_RUTA}/users/editar`, {
                dpi: data.dpi,
                nombre: data.nombre,
                rol: data.rol,
                especialidad: data.especialidad,
                correoUsuario: data.correoUsuario,
                correoFamiliar: data.correoFamiliar,
                edad: data.edad
            });
            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            return "fallo";
        }
    }
    static async actualizarEnfermeroAsignado(data: { idAsignacion: number; nombreEnfermero: string }): Promise<"correcto" | "fallo"> {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/actualizarenfermero`,
                data
            );

            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al actualizar enfermero asignado:", error);
            return "fallo";
        }
    }
    static async actualizarCita(data: {
        idCita: number;
        fechaCita?: string; // "YYYY-MM-DD HH:mm:ss"
        Razon?: string;
        NombreDoctor?: string;
        Especialidad?: string;
    }): Promise<"correcto" | "fallo"> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/actualizarcita`,
                data
            );
            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al actualizar cita:", error);
            return "fallo";
        }
    }
    static async actualizarEstadoCita(IdCita: number, Estado: "Completada" | "Cancelada"): Promise<"correcto" | "fallo"> {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/actualizarestadocita`,
                { idCita: IdCita, estado: Estado }
            );
            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al actualizar estado de cita:", error);
            return "fallo";
        }
    }
    static async suspenderUsuario(data: Record<string, unknown>): Promise<string> {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/suspender`,
                data // aquí no va { data }, solo data
            );
            return response.status === 200 ? "correcto" : "fallo";
        } catch (error) {
            console.error("Error al suspender usuario:", error);
            return "fallo";
        }
    }
    static async quitarMedicamento(IdAccion: number): Promise<"correcto" | "error"> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BK_RUTA}/users/quitar`,
                {
                    IdAccion,
                    nuevoStatus: "Cancelado" // o "Quitado", como quieras llamarlo
                }
            );

            if (response.status === 200) {
                return "correcto";
            } else {
                return "error";
            }
        } catch (err) {
            console.error("Error al actualizar medicamento:", err);
            return "error";
        }
    }
    static async cambiarPasswordUsuario(dpi: string, nuevaPassword: string): Promise<"correcto" | "fallo"> {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BK_RUTA}/users/cambiopass`,
            { dpi, newPassword: nuevaPassword } // coincide con lo que espera tu backend
        );

        return response.status === 200 ? "correcto" : "fallo";
    } catch (error) {
        console.error("Error al cambiar la contraseña del usuario:", error);
        return "fallo";
    }
}

}
