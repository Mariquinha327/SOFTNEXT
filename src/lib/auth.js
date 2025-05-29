import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Token de autorização não fornecido');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = verifyToken(req);
      req.user = user;
      return await handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };
}
