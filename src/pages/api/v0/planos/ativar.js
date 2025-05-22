import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  const decoded = verifyToken(token);
  const planoCliente = {
    cliente_id: decoded.id,
    plano_id: req.body.plano_id,
    ativo: true,
    data_inicio: new Date(),
    data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    conversas_usadas: 0,
  };

  try {
    await db.collection('plano_cliente').doc(decoded.id).set(planoCliente);
    return res.status(200).json({ message: 'Plano ativado.' });
  } catch (error) {
    console.error('Erro ativar plano:', error);
    return res.status(500).json({ error: 'Erro ao ativar plano.' });
  }
}