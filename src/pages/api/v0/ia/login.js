import db from '../../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM clientes WHERE email = ?', [email]);
    const cliente = rows[0];

    if (!cliente) {
      return res.status(401).json({ error: 'Cliente não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      mensagem: 'Login bem-sucedido',
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error); // loga no console
    return res.status(500).json({ error: 'Erro interno no login' });
  }
}