import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  const decoded = verifyToken(token);

  try {
    const snap = await db.collection('plano_cliente').doc(decoded.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Plano não encontrado.' });
    return res.status(200).json(snap.data());
  } catch (error) {
    console.error('Erro verificar plano:', error);
    return res.status(500).json({ error: 'Erro ao verificar plano.' });
  }
}