import db from './database';

export const insertTestUser = () => {
  try {
    const user = getUsuario();
    if (!user) {
      db.runSync(
        `INSERT INTO Usuario (nombre, apellido, tipo, email, password, avatar, pct_ahorro, pct_inversion, min_ahorro, min_inversion, fecha_creacion) 
         VALUES ('Juan', 'Pérez', 'fijo', 'juan@email.com', '123456', 'User', 15, 10, 0, 0, date('now'))`
      );
    }
  } catch (error) {
    console.error("Error inserting test user:", error);
  }
};

export const getUsuario = (): any => {
  return db.getFirstSync('SELECT * FROM Usuario LIMIT 1');
};

// Formato string de mes actual "YYYY-MM"
const getCurrentMonthString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getIngresosFijosPorMes = (mesAnio?: string): any[] => {
  const target = mesAnio || getCurrentMonthString();
  return db.getAllSync('SELECT * FROM Ingresos WHERE tipo_ingreso = "fijo" AND substr(fecha, 1, 7) = ?', [target]);
};

export const getIngresosVariablesPorMes = (mesAnio?: string): any[] => {
  const target = mesAnio || getCurrentMonthString();
  return db.getAllSync('SELECT * FROM Ingresos WHERE tipo_ingreso = "variable" AND substr(fecha, 1, 7) = ?', [target]);
};

export const setIngresoFijo = (id_usuario: number, monto: number, mesAnio?: string) => {
  const target = mesAnio || getCurrentMonthString();
  // Borramos el fijo existente del mes para sobreescribirlo si ya había.
  db.runSync('DELETE FROM Ingresos WHERE id_usuario = ? AND tipo_ingreso = "fijo" AND substr(fecha, 1, 7) = ?', [id_usuario, target]);
  
  const fullDate = new Date().toISOString(); 
  return db.runSync(
    'INSERT INTO Ingresos (id_usuario, monto, tipo_ingreso, descripcion, fecha) VALUES (?, ?, ?, ?, ?)',
    [id_usuario, monto, 'fijo', 'Ingreso fijo mensual', fullDate]
  );
};

export const addIngresoVariable = (id_usuario: number, monto: number, descripcion: string) => {
  const fullDate = new Date().toISOString(); 
  return db.runSync(
    'INSERT INTO Ingresos (id_usuario, monto, tipo_ingreso, descripcion, fecha) VALUES (?, ?, ?, ?, ?)',
    [id_usuario, monto, 'variable', descripcion, fullDate]
  );
};

export const deleteIngreso = (id_ingreso: number) => {
  return db.runSync('DELETE FROM Ingresos WHERE id_ingreso = ?', [id_ingreso]);
};

export const getSaldoTotal = (): number => {
  const resultIn = db.getFirstSync('SELECT SUM(monto) as sum FROM Ingresos') as any;
  const resultOut = db.getFirstSync('SELECT SUM(monto) as sum FROM Gastos') as any;
  const inTotal = resultIn?.sum || 0;
  const outTotal = resultOut?.sum || 0;
  return inTotal - outTotal;
};

export const getTotalesMes = (mesAnio?: string) => {
  const target = mesAnio || getCurrentMonthString();
  const fijos = db.getFirstSync('SELECT SUM(monto) as sum FROM Ingresos WHERE tipo_ingreso="fijo" AND substr(fecha,1,7)=?', [target]) as any;
  const vars = db.getFirstSync('SELECT SUM(monto) as sum FROM Ingresos WHERE tipo_ingreso="variable" AND substr(fecha,1,7)=?', [target]) as any;
  return {
    sumaFijos: fijos?.sum || 0,
    sumaVariables: vars?.sum || 0,
    totalMes: (fijos?.sum || 0) + (vars?.sum || 0)
  };
};

export const getGastosFijos = (id_usuario: number): any[] => {
  return db.getAllSync(
    'SELECT * FROM Gastos WHERE id_usuario = ? AND id_categoria = 1',
    [id_usuario]
  );
};

export const getGastosVariablesPorMesEgresos = (id_usuario: number, mesAnio?: string): any[] => {
  const target = mesAnio || getCurrentMonthString();
  return db.getAllSync(
    'SELECT * FROM Gastos WHERE id_usuario = ? AND id_categoria = 2 AND substr(fecha, 1, 7) = ?',
    [id_usuario, target]
  );
};

export const addGastoFijo = (id_usuario: number, monto: number, descripcion: string) => {
  const fullDate = new Date().toISOString();
  return db.runSync(
    'INSERT INTO Gastos (id_usuario, id_categoria, monto, descripcion, fecha) VALUES (?, 1, ?, ?, ?)',
    [id_usuario, monto, descripcion, fullDate]
  );
};

export const addGastoVariable = (id_usuario: number, monto: number, descripcion: string) => {
  const fullDate = new Date().toISOString();
  return db.runSync(
    'INSERT INTO Gastos (id_usuario, id_categoria, monto, descripcion, fecha) VALUES (?, 2, ?, ?, ?)',
    [id_usuario, monto, descripcion, fullDate]
  );
};

export const updateGasto = (id_gasto: number, monto: number, descripcion: string) => {
  return db.runSync(
    'UPDATE Gastos SET monto = ?, descripcion = ? WHERE id_gasto = ?',
    [monto, descripcion, id_gasto]
  );
};

export const deleteGasto = (id_gasto: number) => {
  return db.runSync('DELETE FROM Gastos WHERE id_gasto = ?', [id_gasto]);
};

export const getTotalEgresosMes = (id_usuario: number, mesAnio?: string) => {
  const target = mesAnio || getCurrentMonthString();
  const fijos = db.getFirstSync(
    'SELECT SUM(monto) as sum FROM Gastos WHERE id_usuario = ? AND id_categoria = 1',
    [id_usuario]
  ) as any;
  const variables = db.getFirstSync(
    'SELECT SUM(monto) as sum FROM Gastos WHERE id_usuario = ? AND id_categoria = 2 AND substr(fecha, 1, 7) = ?',
    [id_usuario, target]
  ) as any;
  return {
    sumaFijos: fijos?.sum || 0,
    sumaVariables: variables?.sum || 0,
    totalEgresos: (fijos?.sum || 0) + (variables?.sum || 0)
  };
};

export const updateUser = (id_usuario: number, nombre: string, avatar: string) => {
  return db.runSync(
    'UPDATE Usuario SET nombre = ?, avatar = ? WHERE id_usuario = ?',
    [nombre, avatar, id_usuario]
  );
};

export const updateAhorroInversionConfig = (id_usuario: number, pct_ahorro: number, pct_inversion: number, min_ahorro: number, min_inversion: number) => {
  return db.runSync(
    'UPDATE Usuario SET pct_ahorro = ?, pct_inversion = ?, min_ahorro = ?, min_inversion = ? WHERE id_usuario = ?',
    [pct_ahorro, pct_inversion, min_ahorro, min_inversion, id_usuario]
  );
};

export const getFondos = (id_usuario: number): any[] => {
  return db.getAllSync('SELECT * FROM Fondos WHERE id_usuario = ?', [id_usuario]);
};

export const addFondo = (id_usuario: number, nombre_fondo: string, meta: number) => {
  return db.runSync(
    'INSERT INTO Fondos (id_usuario, nombre_fondo, meta) VALUES (?, ?, ?)',
    [id_usuario, nombre_fondo, meta]
  );
};

export const updateFondo = (id_fondo: number, nombre_fondo: string, meta: number) => {
  return db.runSync(
    'UPDATE Fondos SET nombre_fondo = ?, meta = ? WHERE id_fondo = ?',
    [nombre_fondo, meta, id_fondo]
  );
};

export const deleteFondo = (id_fondo: number) => {
  return db.runSync('DELETE FROM Fondos WHERE id_fondo = ?', [id_fondo]);
};

// ===================== TARJETA DE CRÉDITO =====================

const getCurrentMonthStringTC = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTarjetaCredito = (id_usuario: number): any => {
  const tarjeta = db.getFirstSync(
    'SELECT * FROM TarjetaCredito WHERE id_usuario = ?',
    [id_usuario]
  );
  if (tarjeta) {
    // Auto-reset si cambió el mes
    const mesActual = getCurrentMonthStringTC();
    if ((tarjeta as any).mes_pagado !== mesActual && (tarjeta as any).pagado === 1) {
      db.runSync(
        'UPDATE TarjetaCredito SET pagado = 0 WHERE id_tarjeta = ?',
        [(tarjeta as any).id_tarjeta]
      );
      return { ...tarjeta, pagado: 0 };
    }
  }
  return tarjeta;
};

export const upsertTarjetaCredito = (id_usuario: number, dia_pago: number) => {
  const existing = db.getFirstSync(
    'SELECT * FROM TarjetaCredito WHERE id_usuario = ?',
    [id_usuario]
  );
  if (existing) {
    return db.runSync(
      'UPDATE TarjetaCredito SET dia_pago = ? WHERE id_usuario = ?',
      [dia_pago, id_usuario]
    );
  } else {
    return db.runSync(
      'INSERT INTO TarjetaCredito (id_usuario, dia_pago, pagado) VALUES (?, ?, 0)',
      [id_usuario, dia_pago]
    );
  }
};

export const marcarPagoTarjeta = (id_usuario: number) => {
  const mesActual = getCurrentMonthStringTC();
  return db.runSync(
    'UPDATE TarjetaCredito SET pagado = 1, mes_pagado = ? WHERE id_usuario = ?',
    [mesActual, id_usuario]
  );
};

export const desmarcarPagoTarjeta = (id_usuario: number) => {
  return db.runSync(
    'UPDATE TarjetaCredito SET pagado = 0, mes_pagado = NULL WHERE id_usuario = ?',
    [id_usuario]
  );
};
