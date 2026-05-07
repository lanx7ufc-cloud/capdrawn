-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    descricao TEXT DEFAULT '',
    cor VARCHAR(7) DEFAULT '#0052e0',
    avatar TEXT DEFAULT NULL,
    area VARCHAR(50) DEFAULT NULL,
    joined VARCHAR(30) DEFAULT '',
    followers INTEGER DEFAULT 0,
    audio_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    vip BOOLEAN DEFAULT FALSE,
    vip_tier VARCHAR(20) DEFAULT NULL,
    verified BOOLEAN DEFAULT FALSE,
    official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de emails @cpd.com
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nascimento DATE NOT NULL,
    handle VARCHAR(50) DEFAULT NULL REFERENCES users(handle) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_handle ON emails(handle);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(50) NOT NULL REFERENCES users(handle),
    texto TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    pinned BOOLEAN DEFAULT FALSE,
    super_chat INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de likes em comentários
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    handle VARCHAR(50) NOT NULL REFERENCES users(handle),
    UNIQUE(comment_id, handle)
);

-- Tabela de seguidores
CREATE TABLE IF NOT EXISTS followers (
    id SERIAL PRIMARY KEY,
    follower_handle VARCHAR(50) NOT NULL REFERENCES users(handle),
    following_handle VARCHAR(50) NOT NULL REFERENCES users(handle),
    UNIQUE(follower_handle, following_handle)
);

-- Tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(50) NOT NULL REFERENCES users(handle),
    url TEXT NOT NULL,
    legenda TEXT DEFAULT '',
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

-- Inserir configurações padrão
INSERT INTO settings (key, value) VALUES 
('maintenance', 'false'),
('admin_password', '7723'),
('tiktok_link', 'https://lite.tiktok.com/ref/capdrawnn'),
('youtube_link', 'https://youtube.com/@capdrawnn')
ON CONFLICT (key) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comments_handle ON comments(handle);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_handle ON videos(handle);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_handle);
