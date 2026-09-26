-- =======================================================
-- 003_patients.sql: Seed Patients
-- =======================================================
INSERT INTO patients (id, name, phone, age, sex, medical_notes)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Ravi Kumar', '+91 9876543210', 34, 'Male', 'Routine checkup, mild cough'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Sita Devi', '+91 9876543211', 28, 'Female', 'Walk-in, fever'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Ananya S.', '+91 9876543212', 45, 'Female', 'Follow-up cardiology consultation'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Rahul M.', '+91 9876543213', 22, 'Male', 'Sprained ankle'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Vikram Singh', '+91 9876543214', 52, 'Male', 'Skin allergy walk-in')
ON CONFLICT (id) DO NOTHING;
