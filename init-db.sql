CREATE DATABASE auth_db;
CREATE DATABASE policy_db;
CREATE DATABASE claims_db;

\c policy_db;

CREATE TABLE IF NOT EXISTS policies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_premium DECIMAL(19, 2),
    type VARCHAR(50)
);

INSERT INTO policies (name, description, base_premium, type) VALUES
('Premier Health Plan', 'Comprehensive global health coverage including outpatient and maternity.', 1200.00, 'HEALTH'),
('Term Life Secure', 'High-value term life insurance with flexible payout options.', 500.00, 'LIFE'),
('Standard Auto Guard', 'Reliable vehicle protection against accidents, theft, and natural disasters.', 850.00, 'VEHICLE'),
('Home Shield Protection', 'Emergency coverage for structural damage and personal property.', 450.00, 'HOME'),
('QuickTravel Essential', 'Short-term travel insurance for medical emergencies and trip cancellations.', 85.00, 'TRAVEL');
