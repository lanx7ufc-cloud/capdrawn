require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));


// ═══════════════════════════════
// FILTRO DE CONTEÚDO IMPRÓPRIO
// ═══════════════════════════════
const PALAVRAS_PROIBIDAS = [
  'merda','porra','caralho','buceta','xoxota','viado','piroca','pau','fdp',
  'filha da puta','vadia','puta','vagabunda','desgraca','arrombado',
  'imbecil','idiota','retardado','babaca','cuzao','foda','fode','fodendo',
  'shit','fuck','bitch','asshole','nigger','cunt','dick','pussy'
];

function filtrarConteudo(texto) {
  if (!texto) return false;
  const lower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PALAVRAS_PROIBIDAS.some(p => lower.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
}

// ═══════════════════════════════
// ROTAS DA API
// ═══════════════════════════════

// ── USUÁRIOS ──

// Criar conta
app.post('/api/register', async (req, res) => {
  try {
    const { handle, name, password, descricao, cor, avatar, area } = req.body;
    if (filtrarConteudo(name) || filtrarConteudo(handle)) {
      return res.json({ success: false, error: 'Nome ou @ contém conteúdo não permitido' });
    }
    const hash = await bcrypt.hash(password, 10);
    const joined = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    const result = await pool.query(
      `INSERT INTO users (handle, name, password_hash, descricao, cor, avatar, area, joined) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
       ON CONFLICT (handle) DO NOTHING RETURNING *`,
      [handle, name, hash, descricao, cor, avatar, area, joined]
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Handle já existe' });
    }
    
    const user = result.rows[0];
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { handle, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE handle = $1', [handle]);
    
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return res.json({ success: false, error: 'Senha incorreta' });
    }
    
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Buscar perfil
app.get('/api/user/:handle', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE handle = $1', [req.params.handle]);
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Usuário não encontrado' });
    }
    
    const user = result.rows[0];
    const audioRes = await pool.query('SELECT * FROM videos WHERE handle = $1 ORDER BY created_at DESC LIMIT 20', [req.params.handle]);
    
    res.json({ success: true, user: formatUser(user, audioRes.rows) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Atualizar perfil
app.put('/api/user/:handle', async (req, res) => {
  try {
    const { name, descricao, cor, avatar, joined } = req.body;
    await pool.query(
      `UPDATE users SET name=$1, descricao=$2, cor=$3, avatar=$4, joined=$5 WHERE handle=$6`,
      [name, descricao, cor, avatar, joined, req.params.handle]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Seguir/Deixar de seguir
app.post('/api/follow', async (req, res) => {
  try {
    const { follower, following } = req.body;
    const exists = await pool.query(
      'SELECT * FROM followers WHERE follower_handle=$1 AND following_handle=$2',
      [follower, following]
    );
    
    if (exists.rows.length > 0) {
      await pool.query('DELETE FROM followers WHERE follower_handle=$1 AND following_handle=$2', [follower, following]);
      await pool.query('UPDATE users SET followers = GREATEST(0, followers - 1) WHERE handle=$1', [following]);
      res.json({ success: true, following: false });
    } else {
      await pool.query('INSERT INTO followers (follower_handle, following_handle) VALUES ($1,$2)', [follower, following]);
      await pool.query('UPDATE users SET followers = followers + 1 WHERE handle=$1', [following]);
      res.json({ success: true, following: true });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Verificar se segue
app.get('/api/isfollowing/:follower/:following', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM followers WHERE follower_handle=$1 AND following_handle=$2',
      [req.params.follower, req.params.following]
    );
    res.json({ following: result.rows.length > 0 });
  } catch (err) {
    res.json({ following: false });
  }
});

// ── COMENTÁRIOS ──

// Listar comentários
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name, u.cor, u.avatar, u.vip, u.verified, u.official, u.area,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as total_likes
      FROM comments c
      JOIN users u ON c.handle = u.handle
      ORDER BY c.pinned DESC, c.created_at DESC
      LIMIT 50
    `);
    res.json({ success: true, comments: result.rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Criar comentário
app.post('/api/comments', async (req, res) => {
  try {
    const { handle, texto, super_chat } = req.body;
    if (filtrarConteudo(texto)) {
      return res.json({ success: false, error: 'Conteúdo não permitido' });
    }
    const result = await pool.query(
      'INSERT INTO comments (handle, texto, super_chat) VALUES ($1,$2,$3) RETURNING *',
      [handle, texto, super_chat || null]
    );
    await pool.query('UPDATE users SET comment_count = comment_count + 1 WHERE handle = $1', [handle]);
    
    const comment = result.rows[0];
    const userRes = await pool.query('SELECT * FROM users WHERE handle = $1', [handle]);
    comment.name = userRes.rows[0].name;
    comment.cor = userRes.rows[0].cor;
    comment.avatar = userRes.rows[0].avatar;
    comment.vip = userRes.rows[0].vip;
    comment.verified = userRes.rows[0].verified;
    
    res.json({ success: true, comment });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Deletar comentário
app.delete('/api/comments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Fixar/Desafixar comentário (ADM)
app.put('/api/comments/:id/pin', async (req, res) => {
  try {
    const { pinned } = req.body;
    if (pinned) {
      await pool.query('UPDATE comments SET pinned = FALSE');
    }
    await pool.query('UPDATE comments SET pinned = $1 WHERE id = $2', [pinned, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Like comment
app.post('/api/comments/:id/like', async (req, res) => {
  try {
    const { handle } = req.body;
    const exists = await pool.query('SELECT * FROM comment_likes WHERE comment_id=$1 AND handle=$2', [req.params.id, handle]);
    
    if (exists.rows.length > 0) {
      await pool.query('DELETE FROM comment_likes WHERE comment_id=$1 AND handle=$2', [req.params.id, handle]);
      await pool.query('UPDATE comments SET likes = GREATEST(0, likes - 1) WHERE id=$1', [req.params.id]);
      res.json({ success: true, liked: false });
    } else {
      await pool.query('INSERT INTO comment_likes (comment_id, handle) VALUES ($1,$2)', [req.params.id, handle]);
      await pool.query('UPDATE comments SET likes = likes + 1 WHERE id=$1', [req.params.id]);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── CONFIGURAÇÕES ──

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ success: true, settings });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
      [req.params.key, req.body.value]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});


// ── EMAILS @cpd.com ──

// Criar email
app.post('/api/email/criar', async (req, res) => {
  try {
    const { nome, senha, nascimento } = req.body;
    if (!nome || !senha || !nascimento) {
      return res.json({ success: false, error: 'Campos obrigatórios faltando' });
    }
    const emailCompleto = nome.toLowerCase().replace(/[^a-z0-9._]/g, '') + '@cpd.com';
    if (senha.length < 6) {
      return res.json({ success: false, error: 'Senha deve ter pelo menos 6 caracteres' });
    }
    // Verificar maioridade
    const nascDate = new Date(nascimento);
    const age = Math.floor((Date.now() - nascDate) / (365.25 * 24 * 3600 * 1000));
    if (age < 13) {
      return res.json({ success: false, error: 'Você precisa ter pelo menos 13 anos' });
    }
    const bcrypt_senha = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO emails (email, senha_hash, nascimento) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO NOTHING RETURNING *`,
      [emailCompleto, bcrypt_senha, nascimento]
    );
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Email já está em uso' });
    }
    res.json({ success: true, email: emailCompleto });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Verificar se email existe
app.get('/api/email/verificar/:email', async (req, res) => {
  try {
    const result = await pool.query('SELECT email, handle FROM emails WHERE email = $1', [req.params.email]);
    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }
    res.json({ exists: true, handle: result.rows[0].handle });
  } catch (err) {
    res.json({ exists: false });
  }
});

// Login com email
app.post('/api/email/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await pool.query('SELECT * FROM emails WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Email não encontrado' });
    }
    const valid = await bcrypt.compare(senha, result.rows[0].senha_hash);
    if (!valid) {
      return res.json({ success: false, error: 'Senha incorreta' });
    }
    const handle = result.rows[0].handle;
    if (!handle) {
      return res.json({ success: true, emailVerified: true, handle: null, message: 'Crie seu canal' });
    }
    const userRes = await pool.query('SELECT * FROM users WHERE handle = $1', [handle]);
    if (userRes.rows.length === 0) {
      return res.json({ success: true, emailVerified: true, handle: null });
    }
    res.json({ success: true, user: formatUser(userRes.rows[0]) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Vincular email a handle após criar canal
app.put('/api/email/vincular', async (req, res) => {
  try {
    const { email, handle } = req.body;
    await pool.query('UPDATE emails SET handle = $1 WHERE email = $2', [handle, email]);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── VÍDEOS ──

app.get('/api/videos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.name, u.cor, u.avatar, u.vip, u.verified 
      FROM videos v 
      JOIN users u ON v.handle = u.handle 
      ORDER BY v.created_at DESC 
      LIMIT 30
    `);
    res.json({ success: true, videos: result.rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════
// SERVE O HTML PRINCIPAL
// ═══════════════════════════════

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ═══════════════════════════════
// INICIA SERVIDOR
// ═══════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ CapDrawn rodando na porta ${PORT}`);
});

// Helper
function formatUser(u, videos = []) {
  return {
    handle: u.handle,
    name: u.name,
    descricao: u.descricao,
    cor: u.cor,
    avatar: u.avatar,
    area: u.area,
    joined: u.joined,
    followers: u.followers,
    audioCount: u.audio_count,
    commentCount: u.comment_count,
    vip: u.vip,
    vipTier: u.vip_tier,
    verified: u.verified,
    official: u.official,
    videos: videos
  };
}
