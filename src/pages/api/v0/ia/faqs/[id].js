import db from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  switch (method) {
    case 'PUT':
      return await updateFAQ(req, res, id);
    case 'DELETE':
      return await deleteFAQ(req, res, id);
    case 'GET':
      return await getFAQ(req, res, id);
    default:
      res.setHeader('Allow', ['PUT', 'DELETE', 'GET']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}

async function getFAQ(req, res, id) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Erro ao buscar FAQ:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function updateFAQ(req, res, id) {
  try {
    const { pergunta, resposta } = req.body;

    // Verificar se a FAQ existe
    const [existing] = await db.execute(
      'SELECT id FROM faqs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    // Preparar campos para atualização
    const updateFields = [];
    const updateValues = [];

    if (pergunta !== undefined) {
      updateFields.push('pergunta = ?');
      updateValues.push(pergunta);
    }

    if (resposta !== undefined) {
      updateFields.push('resposta = ?');
      updateValues.push(resposta);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateValues.push(id);
    
    await db.execute(`
      UPDATE faqs SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, updateValues);

    return res.status(200).json({ message: 'FAQ atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar FAQ:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function deleteFAQ(req, res, id) {
  try {
    // Verificar se a FAQ existe
    const [existing] = await db.execute(
      'SELECT id FROM faqs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'FAQ não encontrada' });
    }

    await db.execute('DELETE FROM faqs WHERE id = ?', [id]);

    return res.status(200).json({ message: 'FAQ removida com sucesso' });

  } catch (error) {
    console.error('Erro ao remover FAQ:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAuth(handler);