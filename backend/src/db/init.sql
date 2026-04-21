CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    garment_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'progress', 'fitting', 'done')),
    deadline DATE NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    deposit NUMERIC(20, 0) DEFAULT 0,
    fabric_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS measurements (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    bust NUMERIC(5, 1),
    waist NUMERIC(5, 1),
    hips NUMERIC(5, 1),
    shoulder_width NUMERIC(5, 1),
    length NUMERIC(5, 1),
    sleeve_length NUMERIC(5, 1)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();