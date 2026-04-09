ALTER TABLE resources
  ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER location,
  ADD COLUMN submitted_by INT NULL AFTER status,
  ADD COLUMN approved_by INT NULL AFTER submitted_by,
  ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
  ADD COLUMN rejection_reason VARCHAR(500) NULL AFTER approved_at;

ALTER TABLE resources
  ADD CONSTRAINT fk_resources_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_resources_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
