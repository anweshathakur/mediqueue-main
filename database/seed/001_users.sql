-- =======================================================
-- 001_users.sql: Seed Admins, Receptionists, and Clinicians
-- =======================================================
INSERT INTO clinics (id, name, address, phone, email)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MediQueue City Hospital', '100 Medical Blvd, Suite 400', '+1 (555) 019-2834', 'admin@mediqueue.health')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, clinic_id, email, phone, role, password_hash)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@mediqueue.health', '+15550192834', 'admin', '$2b$10$hashedpassword'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'reception@mediqueue.health', '+15550192835', 'receptionist', '$2b$10$hashedpassword'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'doctor@mediqueue.health', '+15550192836', 'doctor', '$2b$10$hashedpassword')
ON CONFLICT (email) DO NOTHING;
