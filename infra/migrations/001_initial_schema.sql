-- Room-in-a-Box Database Schema
-- Initial migration for PostgreSQL with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom types
CREATE TYPE product_availability AS ENUM ('in_stock', 'out_of_stock', 'pre_order', 'discontinued');
CREATE TYPE fit_status AS ENUM ('fits', 'fits_with_warning', 'does_not_fit');
CREATE TYPE validation_severity AS ENUM ('error', 'warning', 'info');

-- Products table
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    original_price DECIMAL(10,2),
    dimensions JSONB,
    materials TEXT[],
    colors TEXT[],
    style_tags TEXT[],
    category VARCHAR(100),
    subcategory VARCHAR(100),
    image_url TEXT,
    image_urls TEXT[],
    affiliate_link TEXT,
    availability product_availability DEFAULT 'in_stock',
    stock_quantity INTEGER,
    rating DECIMAL(3,2),
    review_count INTEGER,
    brand VARCHAR(100),
    sku VARCHAR(100),
    partner_id VARCHAR(100) NOT NULL,
    partner_product_id VARCHAR(255) NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    auth0_id VARCHAR(255) UNIQUE,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Design requests table
CREATE TABLE design_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    room_geometry JSONB NOT NULL,
    style_spec JSONB,
    budget_usd DECIMAL(10,2) NOT NULL,
    keep_list JSONB,
    room_type VARCHAR(50),
    preferences JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Design packages table
CREATE TABLE design_packages (
    id VARCHAR(255) PRIMARY KEY,
    request_id VARCHAR(255) REFERENCES design_requests(id),
    shopping_list JSONB NOT NULL,
    room_plan_url TEXT,
    room_plan_3d_url TEXT,
    total_cost JSONB NOT NULL,
    budget_utilization DECIMAL(5,4),
    style_spec JSONB,
    fit_check_results JSONB,
    processing_time_ms INTEGER,
    agent_versions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partner connectors table
CREATE TABLE partner_connectors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inspiration specifications table
CREATE TABLE inspiration_specs (
    id VARCHAR(255) PRIMARY KEY,
    style_tags TEXT[] NOT NULL,
    palette JSONB NOT NULL,
    forms TEXT[] NOT NULL,
    motifs TEXT[],
    moodboard_url TEXT,
    trend_sources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fit check violations table
CREATE TABLE fit_check_violations (
    id SERIAL PRIMARY KEY,
    design_package_id VARCHAR(255) REFERENCES design_packages(id),
    item_id VARCHAR(255),
    violation_type VARCHAR(50) NOT NULL,
    severity validation_severity NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_availability ON products(availability);
CREATE INDEX idx_products_partner_id ON products(partner_id);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_design_requests_user_id ON design_requests(user_id);
CREATE INDEX idx_design_requests_status ON design_requests(status);
CREATE INDEX idx_design_requests_created_at ON design_requests(created_at);

CREATE INDEX idx_design_packages_request_id ON design_packages(request_id);
CREATE INDEX idx_design_packages_created_at ON design_packages(created_at);

CREATE INDEX idx_partner_connectors_type ON partner_connectors(type);
CREATE INDEX idx_partner_connectors_enabled ON partner_connectors(enabled);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_design_requests_updated_at BEFORE UPDATE ON design_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_connectors_updated_at BEFORE UPDATE ON partner_connectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    table_name text
)
RETURNS TABLE (
    id text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT id, 1 - (embedding <=> $1) as similarity
         FROM %I
         WHERE 1 - (embedding <=> $1) > $2
         ORDER BY embedding <=> $1
         LIMIT $3',
        table_name
    ) USING query_embedding, match_threshold, match_count;
END;
$$;

-- Insert sample data
INSERT INTO partner_connectors (id, name, type, config, enabled) VALUES
('amazon_default', 'Amazon PA-API', 'amazon', '{"marketplace": "US"}', true),
('wayfair_default', 'Wayfair', 'wayfair', '{}', false),
('homedepot_default', 'Home Depot', 'homedepot', '{}', false),
('target_default', 'Target', 'target', '{}', false);

-- Create views for common queries
CREATE VIEW product_summary AS
SELECT 
    id,
    name,
    price,
    currency,
    category,
    availability,
    rating,
    review_count,
    brand,
    partner_id
FROM products
WHERE availability = 'in_stock';

CREATE VIEW design_request_summary AS
SELECT 
    dr.id,
    dr.user_id,
    u.name as user_name,
    dr.room_type,
    dr.budget_usd,
    dr.status,
    dr.created_at,
    dp.id as package_id,
    dp.total_cost
FROM design_requests dr
LEFT JOIN users u ON dr.user_id = u.id
LEFT JOIN design_packages dp ON dr.id = dp.request_id;