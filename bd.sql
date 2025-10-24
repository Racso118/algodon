-- =========================================
-- CREACIÓN DE TABLAS DEL SISTEMA
-- Asilo de Ancianos "Cabeza de Algodón"
-- =========================================

CREATE DATABASE IF NOT EXISTS AsiloAncianos;
USE AsiloAncianos;

-- ======================
-- TABLA: Usuario
-- ======================
CREATE TABLE Usuario (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    DPI VARCHAR(20) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Rol ENUM('Admin', 'Doctor', 'Enfermero', 'Paciente', 'Laboratorio', 'Farmacia') NOT NULL,
    Especialidad VARCHAR(100) NULL,
    CorreoUsuario VARCHAR(100) NOT NULL,
    CorreoFamiliar VARCHAR(100) NULL,
    StatusPass ENUM('Activo', 'Reiniciar') DEFAULT 'Activo',
    StatusUsuario ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    Edad INT NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- TABLA: Citas
-- ======================
CREATE TABLE Citas (
    IdCita INT AUTO_INCREMENT PRIMARY KEY,
    DPI VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(100) NOT NULL,
    NombreDoctor VARCHAR(100) NOT NULL,
    Especialidad VARCHAR(100) NOT NULL,
    NombreEspecialista VARCHAR(100) NOT NULL,
    Razon TEXT,
    Estado ENUM('Pendiente', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    FechaCita DATETIME NULL,
    FOREIGN KEY (DPI) REFERENCES Usuario(DPI)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ======================
-- TABLA: Laboratorios
-- ======================
CREATE TABLE Laboratorios (
    IdLaboratorio INT AUTO_INCREMENT PRIMARY KEY,
    DPI VARCHAR(20) NOT NULL,
    NombreExamen VARCHAR(100) NOT NULL,
    CostoExamen DECIMAL(10,2) NOT NULL,
    PrecioExamen DECIMAL(10,2) NOT NULL,
    FechaCreacion DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (DPI) REFERENCES Usuario(DPI)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ======================
-- TABLA: Farmacia
-- ======================
CREATE TABLE Farmacia (
    IdMedicamento INT AUTO_INCREMENT PRIMARY KEY,
    DPI_Paciente VARCHAR(20) NOT NULL,
    NombreMedicamento VARCHAR(100) NOT NULL,
    CantidadExistencia INT NOT NULL,
    CostoMedicamento DECIMAL(10,2) NOT NULL,
    PrecioMedicamento DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (DPI_Paciente) REFERENCES Usuario(DPI)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ======================
-- TABLA: Pagos
-- ======================
CREATE TABLE Pagos (
    IdPago INT AUTO_INCREMENT PRIMARY KEY,
    IdCobro INT NOT NULL,
    DPIPaciente VARCHAR(20) NOT NULL,           -- DPI del paciente
    NombrePaciente VARCHAR(100) NOT NULL,       -- Nombre completo del paciente
    TipoGasto VARCHAR(50) NOT NULL,             -- Tipo de gasto (Medicamento, Consulta, etc.)
    NombreGasto VARCHAR(100) NOT NULL,          -- Nombre del gasto o producto
    Cantidad INT NOT NULL DEFAULT 1,            -- Cantidad de unidades
    PrecioUnitario DECIMAL(10,2) NOT NULL,      -- Precio por unidad
    Total DECIMAL(10,2) NOT NULL,              -- Total = Cantidad * PrecioUnitario
    FechaPago DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha de pago
    FOREIGN KEY (DPIPaciente) REFERENCES Usuario(DPI)
);


-- ======================
-- TABLA: FichaMedica
-- ======================
CREATE TABLE FichaMedica (
    IdFactura INT AUTO_INCREMENT PRIMARY KEY,
    DPIPaciente VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(100) NOT NULL,
    NombreMedico VARCHAR(100) NOT NULL,
    EspecialidadMedico VARCHAR(100) NOT NULL,
    Observaciones TEXT NULL,
    Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DPIPaciente) REFERENCES Usuario(DPI)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE FichaAccion (
    IdAccion INT AUTO_INCREMENT PRIMARY KEY,
    IdFactura INT NOT NULL,
    Accion ENUM('Medicamento', 'Examen') NOT NULL,
    NombreAccion VARCHAR(100) NOT NULL,
    Cantidad INT DEFAULT 1,
    Frecuencia VARCHAR(100) NULL,
    FOREIGN KEY (IdFactura) REFERENCES FichaMedica(IdFactura)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
-- Ver detalles de las fichas médicas junto con las acciones asociadas
SELECT
    fm.IdFactura,
    fm.DPIPaciente,
    fm.NombrePaciente,
    fm.NombreMedico,
    fm.EspecialidadMedico,
    fm.Fecha,
    fm.Observaciones,
    fa.IdAccion,
    fa.Accion AS TipoAccion,
    fa.NombreAccion,
    fa.Cantidad,
    fa.StatusAccion,
    fa.Frecuencia
FROM FichaMedica fm
LEFT JOIN FichaAccion fa
    ON fm.IdFactura = fa.IdFactura
ORDER BY fm.Fecha DESC, fm.IdFactura, fa.IdAccion;
-- Ver medicamentos asignasdos
SELECT
    fm.IdFactura,
    fm.DPIPaciente,
    fm.NombrePaciente,
    fm.NombreMedico,
    fm.EspecialidadMedico,
    fm.Fecha,
    fa.IdAccion,
    fa.Accion AS TipoAccion,
    fa.NombreAccion AS Medicamento,
    fa.Cantidad,
    fa.Frecuencia,
    fa.StatusAccion
FROM FichaMedica fm
INNER JOIN FichaAccion fa
    ON fm.IdFactura = fa.IdFactura
WHERE fa.Accion = 'Medicamento'
ORDER BY fm.Fecha DESC, fm.IdFactura, fa.IdAccion;
-- Ver examenes asignados
SELECT
    fm.IdFactura,
    fm.DPIPaciente,
    fm.NombrePaciente,
    fm.NombreMedico,
    fm.EspecialidadMedico,
    fm.Fecha,
    fa.IdAccion,
    fa.Accion AS TipoAccion,
    fa.NombreAccion AS Examen,
    fa.Cantidad,
    fa.Frecuencia,
    fa.StatusAccion
FROM FichaMedica fm
INNER JOIN FichaAccion fa
    ON fm.IdFactura = fa.IdFactura
WHERE fa.Accion = 'Examen'
ORDER BY fm.Fecha DESC, fm.IdFactura, fa.IdAccion;
-- Ver las cita medicas de un paciente específico junto con sus fichas médicas y acciones
SELECT
    fm.DPIPaciente,
    fm.NombrePaciente,
    fm.NombreMedico AS Doctor,
    fm.EspecialidadMedico,
    fm.Fecha
FROM FichaMedica fm
WHERE fm.DPIPaciente = 20202020
ORDER BY fm.Fecha DESC;

-- ======================
-- TABLA: EnfermeroAsignado 
-- ======================

CREATE TABLE EnfermeroAsignado (
    IdAsignacion INT AUTO_INCREMENT PRIMARY KEY,
    DPIPaciente VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(100) NOT NULL,
    NombreEnfermero VARCHAR(100) NOT NULL,
    FechaAsignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DPIPaciente) REFERENCES Usuario(DPI)
);



-- ======================
-- TABLA: Gastos
-- ======================
CREATE TABLE Gastos (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DPIPaciente VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(100) NOT NULL,
    TipoGasto VARCHAR(50) NOT NULL,
    NombreGasto VARCHAR(100) NOT NULL,
    Cantidad DECIMAL(10,2) NOT NULL,
    Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DPIPaciente) REFERENCES Usuario(DPI)
);

-- Lista de gastos
SELECT
    g.ID,
    g.DPIPaciente AS DPI,
    g.NombrePaciente,
    g.TipoGasto AS Accion,
    g.Fecha,
    p.PrecioUnitario * g.Cantidad AS PrecioTotal
FROM Gastos g
LEFT JOIN Precios p
    ON (
        (g.TipoGasto = 'Consulta' AND g.NombreGasto = p.Nombre)
        OR (g.TipoGasto <> 'Consulta' AND g.TipoGasto = p.Nombre)
    )
ORDER BY g.NombrePaciente, g.Fecha DESC;


-- ======================
-- TABLA: Gastos
-- ======================
CREATE TABLE Precios (
    Nombre VARCHAR(100) PRIMARY KEY,
    PrecioUnitario DECIMAL(10,2) NOT NULL
);

INSERT INTO Precios (Nombre, PrecioUnitario) VALUES
('Medicamento', 30.00),
('Examenes', 40.00),
('General', 35.00),
('Especialista', 45.00);

