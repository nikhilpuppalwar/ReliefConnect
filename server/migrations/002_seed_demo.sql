USE disaster_relief;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE certificates;
TRUNCATE TABLE resource_allocations;
TRUNCATE TABLE tasks;
TRUNCATE TABLE help_requests;
TRUNCATE TABLE volunteers;
TRUNCATE TABLE disaster_media;
TRUNCATE TABLE disasters;
TRUNCATE TABLE resources;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, name, email, password, role) VALUES
  (1, 'Admin User', 'admin@example.com', '$2a$10$3euPcmQFCiblsZeEu5s7p.e8M4sN0bM42Hf2f3f3xTjM3xH7y9yQG', 'admin'),
  (2, 'Civilian One', 'civilian@example.com', '$2a$10$3euPcmQFCiblsZeEu5s7p.e8M4sN0bM42Hf2f3f3xTjM3xH7y9yQG', 'civilian'),
  (3, 'Volunteer One', 'volunteer@example.com', '$2a$10$3euPcmQFCiblsZeEu5s7p.e8M4sN0bM42Hf2f3f3xTjM3xH7y9yQG', 'volunteer');

INSERT INTO volunteers (id, user_id, skills, experience_years, zone, availability_status, verified) VALUES
  (3, 3, 'Medical,Rescue', 3, 'Sector A', 'available', 1);

INSERT INTO disasters (id, title, description, type, severity, location, status, reported_by) VALUES
  (1, 'Flood in Sector A', 'River overflow affecting homes and roads.', 'flood', 'high', 'Sector A', 'active', 2),
  (2, 'Wildfire Near Hillside', 'Forest edge fire spreading toward nearby village.', 'wildfire', 'critical', 'Hillside Zone', 'monitoring', 1);

INSERT INTO disaster_media (id, disaster_id, media_url, media_type) VALUES
  (1, 1, 'https://example-bucket.s3.ap-south-1.amazonaws.com/disasters/demo-flood.jpg', 'image/jpeg');

INSERT INTO help_requests (id, user_id, volunteer_id, title, description, location, priority, status, media_url) VALUES
  (1, 2, 3, 'Need evacuation support', 'Family trapped in first-floor home.', 'Sector A - Block 12', 'critical', 'assigned', 'https://example-bucket.s3.ap-south-1.amazonaws.com/requests/demo-request.jpg'),
  (2, 2, NULL, 'Need clean water', 'No safe drinking water in shelter.', 'Sector A Shelter', 'high', 'pending', NULL);

INSERT INTO tasks (id, title, description, disaster_id, volunteer_id, due_date, status, proof_url, created_by, completed_at) VALUES
  (1, 'Deliver first-aid kits', 'Deliver 20 kits to Sector A shelter.', 1, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), 'in_progress', NULL, 1, NULL),
  (2, 'Assess evacuation route', 'Survey and report route safety.', 2, 3, DATE_ADD(NOW(), INTERVAL 2 DAY), 'assigned', NULL, 1, NULL);

INSERT INTO resources (id, name, quantity, unit, location) VALUES
  (1, 'Water Bottles', 500, 'pcs', 'Warehouse 1'),
  (2, 'Medical Kits', 120, 'kits', 'Warehouse 2'),
  (3, 'Blankets', 300, 'pcs', 'Warehouse 1');

INSERT INTO resource_allocations (id, resource_id, disaster_id, quantity, note, allocated_by) VALUES
  (1, 1, 1, 100, 'Initial flood response', 1),
  (2, 2, 1, 20, 'Urgent first-aid dispatch', 1);

INSERT INTO certificates (id, volunteer_id, title, issued_on, certificate_url, issued_by) VALUES
  (1, 3, 'Flood Response Level 1', NOW(), 'https://example-bucket.s3.ap-south-1.amazonaws.com/certificates/demo-cert.pdf', 1);

ALTER TABLE users AUTO_INCREMENT = 10;
ALTER TABLE volunteers AUTO_INCREMENT = 10;
ALTER TABLE disasters AUTO_INCREMENT = 10;
ALTER TABLE disaster_media AUTO_INCREMENT = 10;
ALTER TABLE help_requests AUTO_INCREMENT = 10;
ALTER TABLE tasks AUTO_INCREMENT = 10;
ALTER TABLE resources AUTO_INCREMENT = 10;
ALTER TABLE resource_allocations AUTO_INCREMENT = 10;
ALTER TABLE certificates AUTO_INCREMENT = 10;
