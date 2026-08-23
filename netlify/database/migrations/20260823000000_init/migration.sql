CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  alias TEXT,
  telefono TEXT,
  ubicacion TEXT,
  plataforma TEXT,
  color TEXT,
  notas TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grupos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  foto TEXT,
  costo_usd NUMERIC DEFAULT 0,
  tipo_cambio NUMERIC DEFAULT 0,
  impuesto_pct NUMERIC DEFAULT 0,
  impuesto_monto NUMERIC DEFAULT 0,
  costo_mxn NUMERIC DEFAULT 0,
  precio_mxn NUMERIC DEFAULT 0,
  ganancia NUMERIC DEFAULT 0,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  grupo_id TEXT REFERENCES grupos(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abonos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES clientes(id) ON DELETE CASCADE,
  monto NUMERIC DEFAULT 0,
  nota TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abonos_cliente ON abonos(cliente_id);
