import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  const decoded = verifyToken(token);
  const { id } = req.query;
  const ref = db.collection('faqs').doc(id);

  try {
    if (req.method === 'PUT') {
      await ref.update(req.body);
      return res.status(200).json({ message: 'FAQ atualizada.' });
    }

    if (req.method === 'DELETE') {
      await ref.delete();
      return res.status(200).json({ message: 'FAQ removida.' });
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Erro FAQ ID:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}