import { getDatabase } from "@netlify/database";
import crypto from "crypto";

const db = getDatabase();

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const newId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function verifyToken(token, secret) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export default async (req) => {
  const SECRET = process.env.SESSION_SECRET;
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!SECRET || !verifyToken(token, SECRET)) {
    return json(401, { error: "No autorizado" });
  }

  const url = new URL(req.url);
  // path after /api/data/
  const parts = url.pathname.replace(/^\/api\/data\/?/, "").split("/").filter(Boolean);
  const [resource, id] = parts;
  const method = req.method;

  try {
    // ---------- ESTADO COMPLETO ----------
    if (resource === "estado" && method === "GET") {
      const [clientes, grupos, ventas, abonos] = await Promise.all([
        db.sql`SELECT * FROM clientes ORDER BY fecha DESC`,
        db.sql`SELECT * FROM grupos ORDER BY fecha DESC`,
        db.sql`SELECT * FROM ventas ORDER BY fecha DESC`,
        db.sql`SELECT * FROM abonos ORDER BY fecha DESC`,
      ]);
      return json(200, { clientes, grupos, ventas, abonos });
    }

    // ---------- CLIENTES ----------
    if (resource === "clientes" && method === "POST") {
      const b = await req.json();
      const id = newId("c");
      const [row] = await db.sql`
        INSERT INTO clientes (id, nombre, alias, telefono, ubicacion, plataforma, color, notas)
        VALUES (${id}, ${b.nombre}, ${b.alias || ""}, ${b.telefono || ""}, ${b.ubicacion || ""}, ${b.plataforma || ""}, ${b.color || ""}, ${b.notas || ""})
        RETURNING *`;
      return json(200, row);
    }

    // ---------- GRUPOS ----------
    if (resource === "grupos" && method === "POST") {
      const b = await req.json();
      const id = newId("g");
      const [row] = await db.sql`
        INSERT INTO grupos (id, nombre) VALUES (${id}, ${b.nombre}) RETURNING *`;
      return json(200, row);
    }

    // ---------- VENTAS ----------
    if (resource === "ventas" && method === "POST") {
      const b = await req.json();
      const id = newId("v");
      const [row] = await db.sql`
        INSERT INTO ventas (id, nombre, categoria, foto, costo_usd, tipo_cambio, impuesto_pct, impuesto_monto, costo_mxn, precio_mxn, ganancia, cliente_id, grupo_id)
        VALUES (${id}, ${b.nombre}, ${b.categoria || ""}, ${b.foto || null}, ${b.costoUSD || 0}, ${b.tipoCambio || 0}, ${b.impuestoPct || 0}, ${b.impuestoMonto || 0}, ${b.costoMXN || 0}, ${b.precioMXN || 0}, ${b.ganancia || 0}, ${b.clienteId || null}, ${b.grupoId || null})
        RETURNING *`;
      return json(200, row);
    }

    // ---------- ABONOS ----------
    if (resource === "abonos" && method === "POST") {
      const b = await req.json();
      const id = newId("a");
      const [row] = await db.sql`
        INSERT INTO abonos (id, cliente_id, monto, nota)
        VALUES (${id}, ${b.clienteId}, ${b.monto || 0}, ${b.nota || ""})
        RETURNING *`;
      return json(200, row);
    }

    return json(404, { error: "No encontrado" });
  } catch (err) {
    return json(500, { error: String(err) });
  }
};

export const config = { path: "/api/data/*" };
