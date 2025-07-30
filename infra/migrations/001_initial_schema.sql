-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    auth_provider VARCHAR(50) DEFAULT 'auth0',
    auth_provider_id VARCHAR(255),
    profile_image_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner retailers table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    api_type VARCHAR(50) NOT NULL, -- 'amazon', 'cj', 'wayfair', etc.
    api_config JSONB NOT NULL,
    commission_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table with vector embeddings
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL, -- Partner's product ID
    partner_id UUID REFERENCES partners(id),
    name TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    dimensions JSONB NOT NULL, -- {width_cm, length_cm, height_cm, weight_kg}
    price JSONB NOT NULL, -- {amount, currency, original_amount, sale}
    materials TEXT[],
    colors TEXT[],
    style_tags TEXT[],
    images JSONB NOT NULL, -- [{url, alt, is_primary}]
    affiliate_link TEXT NOT NULL,
    availability JSONB NOT NULL, -- {in_stock, stock_level, estimated_delivery_days}
    ratings JSONB, -- {average, count}
    embedding vector(1536), -- OpenAI embeddings
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, partner_id)
);

-- Inspiration specs table
CREATE TABLE inspiration_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    style_tags TEXT[] NOT NULL,
    palette TEXT[] NOT NULL, -- hex color codes
    forms TEXT[],
    motifs TEXT[],
    materials TEXT[],
    mood VARCHAR(50) NOT NULL,
    moodboard_url TEXT,
    sources JSONB DEFAULT '[]', -- [{type, url, confidence}]
    embedding vector(1536),
    version VARCHAR(10) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User requests table
CREATE TABLE user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    request_data JSONB NOT NULL, -- Full user request JSON
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    inspiration_spec_id UUID REFERENCES inspiration_specs(id),
    result_data JSONB, -- Final package-ready JSON
    processing_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room designs table
CREATE TABLE room_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    request_id UUID REFERENCES user_requests(id),
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    dimensions JSONB NOT NULL, -- {width_cm, length_cm, height_cm}
    plan_image_url TEXT,
    plan_3d_url TEXT,
    layout_score INTEGER,
    furniture_items JSONB NOT NULL, -- Array of placed furniture
    total_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping lists table
CREATE TABLE shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_design_id UUID REFERENCES room_designs(id),
    user_id UUID REFERENCES users(id),
    items JSONB NOT NULL, -- Array of shopping list items
    total_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active', -- active, purchased, archived
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trend data table
CREATE TABLE trend_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL, -- rss, instagram, pinterest
    source_url TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    tags TEXT[],
    confidence DECIMAL(3,2),
    embedding vector(1536),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Product sync jobs table
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    job_type VARCHAR(50) NOT NULL, -- full_sync, incremental, single_product
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    products_processed INTEGER DEFAULT 0,
    products_added INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    products_failed INTEGER DEFAULT 0,
    error_log TEXT[],
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_products_partner_id ON products(partner_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_style_tags ON products USING GIN(style_tags);
CREATE INDEX idx_products_price ON products USING GIN(price);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_inspiration_specs_style_tags ON inspiration_specs USING GIN(style_tags);
CREATE INDEX idx_inspiration_specs_embedding ON inspiration_specs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_user_requests_user_id ON user_requests(user_id);
CREATE INDEX idx_user_requests_status ON user_requests(status);
CREATE INDEX idx_user_requests_created_at ON user_requests(created_at);

CREATE INDEX idx_room_designs_user_id ON room_designs(user_id);
CREATE INDEX idx_room_designs_room_type ON room_designs(room_type);
CREATE INDEX idx_room_designs_is_public ON room_designs(is_public);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_status ON shopping_lists(status);

CREATE INDEX idx_trend_data_source_type ON trend_data(source_type);
CREATE INDEX idx_trend_data_tags ON trend_data USING GIN(tags);
CREATE INDEX idx_trend_data_embedding ON trend_data USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_trend_data_processed_at ON trend_data(processed_at);

CREATE INDEX idx_sync_jobs_partner_id ON sync_jobs(partner_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_created_at ON sync_jobs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_requests_updated_at BEFORE UPDATE ON user_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_designs_updated_at BEFORE UPDATE ON room_designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default partner configurations
INSERT INTO partners (name, slug, api_type, api_config, commission_rate, is_active) VALUES
('Amazon', 'amazon', 'amazon', '{"region": "US", "marketplace": "ATVPDKIKX0DER"}', 4.00, true),
('Wayfair', 'wayfair', 'cj', '{"advertiser_id": "3112", "relationship_status": "joined"}', 5.00, true),
('Home Depot', 'homedepot', 'api', '{"base_url": "https://api.homedepot.com"}', 3.00, true),
('Target', 'target', 'api', '{"base_url": "https://api.target.com"}', 2.50, true);

-- Insert sample inspiration specs
INSERT INTO inspiration_specs (name, style_tags, palette, forms, motifs, materials, mood) VALUES
('Modern Minimalist', 
 ARRAY['modern', 'minimalist', 'contemporary'], 
 ARRAY['#ffffff', '#f5f5f5', '#e0e0e0', '#757575', '#212121'],
 ARRAY['geometric', 'linear', 'angular'],
 ARRAY['clean lines', 'negative space'],
 ARRAY['wood', 'metal', 'glass'],
 'calm'),
 
('Bohemian Chic', 
 ARRAY['bohemian', 'eclectic', 'vintage'], 
 ARRAY['#8B4513', '#DEB887', '#F4A460', '#CD853F', '#A0522D'],
 ARRAY['organic', 'curved', 'flowing'],
 ARRAY['ethnic patterns', 'textile art', 'natural textures'],
 ARRAY['rattan', 'fabric', 'wood', 'leather'],
 'warm'),
 
('Scandinavian Hygge', 
 ARRAY['scandinavian', 'hygge', 'cozy'], 
 ARRAY['#F7F3E9', '#E8DDD4', '#D0B8A8', '#8B5A3C', '#4A4A4A'],
 ARRAY['rounded', 'organic', 'simple'],
 ARRAY['natural wood grain', 'wool textures'],
 ARRAY['wood', 'wool', 'linen', 'ceramic'],
 'cozy');

-- Create materialized view for product search
CREATE MATERIALIZED VIEW product_search_view AS
SELECT 
    p.id,
    p.product_id,
    p.name,
    p.category,
    p.style_tags,
    p.price,
    p.dimensions,
    p.embedding,
    pr.name as partner_name,
    pr.slug as partner_slug
FROM products p
JOIN partners pr ON p.partner_id = pr.id
WHERE pr.is_active = true;

CREATE INDEX idx_product_search_view_category ON product_search_view(category);
CREATE INDEX idx_product_search_view_style_tags ON product_search_view USING GIN(style_tags);
CREATE INDEX idx_product_search_view_embedding ON product_search_view USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_product_search_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_search_view;
END;
$$ LANGUAGE plpgsql;