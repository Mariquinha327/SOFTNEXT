import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL do arquivo é obrigatória' });
    }

    await del(url);

    return res.status(200).json({
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
}