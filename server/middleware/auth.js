import jwt from "jsonwebtoken";

export function verifyAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secure_jwt_secret_key_change_me_in_production_2026");
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
}
