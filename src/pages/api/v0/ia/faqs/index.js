import { db } from '@/lib/firebaseAdmin';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente.' });

  const decoded = verifyToken(token);
  const ref = db.collection('faqs').where('cliente_id', '==', decoded.id);

  try {
    if (req.method === 'POST') {
      const novaFAQ = { ...req.body, cliente_id: decoded.id, createdAt: new Date() };
      await db.collection('faqs').add(novaFAQ);
      return res.status(201).json({ message: 'FAQ adicionada.' });
    }

    if (req.method === 'GET') {
      const snap = await ref.get();
      const faqs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(faqs);
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Erro FAQ:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
}