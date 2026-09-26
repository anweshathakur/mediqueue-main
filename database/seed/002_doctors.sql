-- =======================================================
-- 002_doctors.sql: Seed Doctors & Specialties
-- =======================================================
INSERT INTO doctors (id, name, specialty, status, current_delay, patients_ahead)
VALUES 
  (1, 'Dr. Arjun Mehta', 'General Medicine', 'available', 0, 2),
  (2, 'Dr. Priya Sharma', 'Cardiology', 'delayed', 30, 5),
  (3, 'Dr. Rohan Kapoor', 'Orthopedics', 'available', 0, 1),
  (4, 'Dr. Sneha Iyer', 'Dermatology', 'available', 0, 3),
  (5, 'Dr. Vikram Rao', 'Pediatrics', 'delayed', 15, 4),
  (6, 'Dr. Ananya Das', 'ENT', 'available', 0, 0)
ON CONFLICT (id) DO NOTHING;
