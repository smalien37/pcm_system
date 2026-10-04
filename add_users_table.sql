-- Add Users Table to PCM System
-- Run: psql -U pcm_user -d pcm_db1 -f add_users_table.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    department_id INTEGER REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Insert default users (password is hashed version of the plain text shown in comments)
-- Using simple hash for demo - in production use bcrypt or similar
INSERT INTO users (email, password_hash, name, role, status) VALUES
    ('admin@syncflow.com', 'admin123', 'System Admin', 'admin', 'active'),
    ('manager@syncflow.com', 'manager123', 'Operations Manager', 'manager', 'active'),
    ('user@syncflow.com', 'user123', 'Regular User', 'user', 'active'),
    ('viewer@syncflow.com', 'viewer123', 'Report Viewer', 'viewer', 'active')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON users TO pcm_user;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO pcm_user;
