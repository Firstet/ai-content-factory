-- AI Content Factory — PostgreSQL Initialization
-- This script runs once on first container start.

-- Ensure the database exists with proper settings
ALTER DATABASE acf_db SET timezone TO 'UTC';

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Grants (Prisma needs full access)
GRANT ALL PRIVILEGES ON DATABASE acf_db TO acf_user;
