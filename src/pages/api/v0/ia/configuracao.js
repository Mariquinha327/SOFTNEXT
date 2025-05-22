import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  const decoded = verifyToken(token);
  const ref = db.collection('configuracoesIA').doc(decoded.id);

  try {
    if (req.method === 'POST') {
      await ref.set({ ...req.body, createdAt: new Date() });
      return res.status(201).json({ message: 'Configuração criada.' });
    }

    if (req.method === 'GET') {
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: 'Não encontrada.' });
      return res.status(200).json(snap.data());
    }

    if (req.method === 'PUT') {
      await ref.update(req.body);
      return res.status(200).json({ message: 'Configuração atualizada.' });
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}