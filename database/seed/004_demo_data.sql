-- =======================================================
-- 004_demo_data.sql: Seed Live Queue & Clinical History
-- =======================================================
INSERT INTO hospital_queue (id, name, phone, type, scheduled, status, doctor_name)
VALUES 
  ('101', 'Ravi Kumar', '+91 9876543210', 'Online', '2:00 PM', 'Waiting', 'Dr. Arjun Mehta'),
  ('102', 'Sita Devi', '+91 9876543211', 'Walk-in', '2:15 PM', 'Waiting', 'Dr. Priya Sharma'),
  ('103', 'Ananya S.', '+91 9876543212', 'Online', '2:30 PM', 'Waiting', 'Dr. Rohan Kapoor'),
  ('104', 'Rahul M.', '+91 9876543213', 'Online', '2:45 PM', 'Waiting', 'Dr. Sneha Iyer'),
  ('105', 'Vikram Singh', '+91 9876543214', 'Walk-in', '3:00 PM', 'Waiting', 'Dr. Vikram Rao')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_state (singleton_id, avg_time, global_delay)
VALUES ('global_state', 15, 0)
ON CONFLICT (singleton_id) DO NOTHING;

INSERT INTO patient_history (patient_name, patient_type, doctor_name, diagnosis, duration_mins)
VALUES 
  ('Aarav Patel', 'Online', 'Dr. Arjun Mehta', 'Seasonal allergies, antihistamines prescribed', 15),
  ('Neha Gupta', 'Walk-in', 'Dr. Priya Sharma', 'Hypertension review, dosage adjusted', 20),
  ('Rajesh Khanna', 'Online', 'Dr. Rohan Kapoor', 'Post-op fracture review, recovery on track', 15)
ON CONFLICT DO NOTHING;
