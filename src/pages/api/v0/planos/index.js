import { db } from '@/lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const snap = await db.collection('planos').get();
    const planos = snap.docs.map(doc => doc.data());
    return res.status(200).json(planos);
  } catch (error) {
    console.error('Erro planos:', error);
    return res.status(500).json({ error: 'Erro ao buscar planos.' });
  }
}