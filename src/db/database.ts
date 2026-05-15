import * as SQLite from 'expo-sqlite';

// Initialize the database connection
const db = SQLite.openDatabaseSync('Ahorrando_ando_v5.db');

/**
 * Creates the database schema replicating the Ahorrando_ando.sql structure
 * SQLite does not support ENUMs directly, so we use TEXT with CHECK constraints
 * and omit AUTO_INCREMENT which is handled by INTEGER PRIMARY KEY automatically.
 */
export const initDatabase = () => {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Usuario (
        id_usuario INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        tipo TEXT CHECK(tipo IN ('fijo', 'variable')) NOT NULL DEFAULT 'fijo',
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL, 
        avatar TEXT DEFAULT 'User',
        pct_ahorro REAL DEFAULT 15,
        pct_inversion REAL DEFAULT 10,
        min_ahorro REAL DEFAULT 0,
        min_inversion REAL DEFAULT 0,
        fecha_creacion TEXT
    );

    CREATE TABLE IF NOT EXISTS Categoria_Gastos (
        id_categoria INTEGER PRIMARY KEY,
        nombre_categoria TEXT NOT NULL,
        tipo TEXT CHECK(tipo IN ('fijo', 'variable')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Ingresos (
        id_ingreso INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        monto REAL NOT NULL,
        tipo_ingreso TEXT CHECK(tipo_ingreso IN ('fijo', 'variable')) NOT NULL,
        descripcion TEXT,
        fecha TEXT NOT NULL, 
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Gastos (
        id_gasto INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        id_categoria INTEGER NOT NULL,
        monto REAL NOT NULL,
        descripcion TEXT,
        fecha TEXT NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (id_categoria) REFERENCES Categoria_Gastos(id_categoria) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Fondos (
        id_fondo INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        nombre_fondo TEXT CHECK(nombre_fondo IN ('viajes', 'salud', 'escuela', 'emergencia', 'Otro')) NOT NULL,
        meta REAL NOT NULL,
        saldo_actual REAL NOT NULL DEFAULT 0.00,
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Movimiento_Fondos (
        id_movimiento INTEGER PRIMARY KEY,
        id_fondo INTEGER NOT NULL,
        tipo_movimiento TEXT CHECK(tipo_movimiento IN ('deposito', 'retiro')) NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (id_fondo) REFERENCES Fondos(id_fondo) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Ahorros (
        id_ahorro INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        tipo_ahorro TEXT CHECK(tipo_ahorro IN ('ahorro', 'inversion')) NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Movimiento_ahorro (
        id_movimiento INTEGER PRIMARY KEY,
        id_ahorro INTEGER NOT NULL,
        tipo_movimiento TEXT CHECK(tipo_movimiento IN ('deposito', 'retiro')) NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        FOREIGN KEY (id_ahorro) REFERENCES Ahorros(id_ahorro) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TarjetaCredito (
        id_tarjeta INTEGER PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        dia_pago INTEGER NOT NULL CHECK(dia_pago >= 1 AND dia_pago <= 31),
        pagado INTEGER NOT NULL DEFAULT 0,
        mes_pagado TEXT,
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
    );

    INSERT OR IGNORE INTO Categoria_Gastos (id_categoria, nombre_categoria, tipo) VALUES (1, 'Gasto Fijo', 'fijo');
    INSERT OR IGNORE INTO Categoria_Gastos (id_categoria, nombre_categoria, tipo) VALUES (2, 'Gasto Variable', 'variable');
  `);
};

export default db;
