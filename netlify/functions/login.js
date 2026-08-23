import crypto from "crypto";

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Método no permitido" });

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SECRET = process.env.SESSION_SECRET;

  if (!ADMIN_USER || !ADMIN_PASSWORD || !SECRET) {
    return json(500, { error: "El servidor no tiene configuradas las credenciales." });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Solicitud inválida" });
  }

  const { usuario, password } = body || {};
  const usuarioLimpio = (usuario || "").trim();
  const passwordLimpio = (password || "").trim();
  if (usuarioLimpio !== ADMIN_USER.trim() || passwordLimpio !== ADMIN_PASSWORD.trim()) {
    return json(401, { error: "Usuario o contraseña incorrectos" });
  }

  const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
  const exp = Date.now() + SIETE_DIAS_MS;
  const token = sign({ u: usuarioLimpio, exp }, SECRET);

  return json(200, { token, exp });
};

export const config = { path: "/api/login" };
