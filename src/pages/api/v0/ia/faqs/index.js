import db from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'POST':
      return await createFAQ(req, res);
    case 'GET':
      return await getFAQs(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}

async function createFAQ(req, res) {
  try {
    const { cliente_id, pergunta, resposta } = req.body;

    if (!cliente_id || !pergunta || !resposta) {
      return res.status(400).json({ 
        error: 'cliente_id, pergunta e resposta são obrigatórios' 
      });
    }

    const [result] = await db.execute(`
      INSERT INTO faqs (cliente_id, pergunta, resposta) 
      VALUES (?, ?, ?)
    `, [cliente_id, pergunta, resposta]);

    return res.status(201).json({
      message: 'FAQ criada com sucesso',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar FAQ:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getFAQs(req, res) {
  try {
    const { cliente_id, page = 1, limit = 10, search } = req.query;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id é obrigatório' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = 'SELECT * FROM faqs WHERE cliente_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM faqs WHERE cliente_id = ?';
    let params = [cliente_id];

    // Adicionar busca se fornecida
    if (search) {
      query += ' AND (pergunta LIKE ? OR resposta LIKE ?)';
      countQuery += ' AND (pergunta LIKE ? OR resposta LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    // Adicionar ordenação e paginação
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute(countQuery, params.slice(0, -2));
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    return res.status(200).json({
      faqs: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar FAQs:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAuth(handler);
