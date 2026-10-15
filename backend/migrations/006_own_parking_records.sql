ALTER TABLE parking
    ADD COLUMN user_id INT NULL,
    ADD INDEX idx_parking_user_id (user_id),
    ADD CONSTRAINT fk_parking_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL;

INSERT INTO permissions (permission_name)
SELECT 'VIEW_OWN_PARKING_RECORDS'
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permission_name = 'VIEW_OWN_PARKING_RECORDS'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.permission_name = 'VIEW_OWN_PARKING_RECORDS'
WHERE roles.roles_name = 'Parker'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_permissions.role_id = roles.id
        AND role_permissions.permission_id = permissions.id
  );
