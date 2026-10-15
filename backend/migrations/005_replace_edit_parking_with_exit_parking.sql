INSERT INTO permissions (permission_name)
SELECT 'EXIT_PARKING'
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permission_name = 'EXIT_PARKING'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT old_assignment.role_id, exit_permission.id
FROM role_permissions AS old_assignment
JOIN permissions AS old_permission
    ON old_permission.id = old_assignment.permission_id
JOIN permissions AS exit_permission
    ON exit_permission.permission_name = 'EXIT_PARKING'
WHERE UPPER(REPLACE(old_permission.permission_name, ' ', '_')) = 'EDIT_PARKING'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions AS existing_assignment
      WHERE existing_assignment.role_id = old_assignment.role_id
        AND existing_assignment.permission_id = exit_permission.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.permission_name = 'EXIT_PARKING'
WHERE roles.roles_name = 'Manager'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_permissions.role_id = roles.id
        AND role_permissions.permission_id = permissions.id
  );

DELETE role_permissions
FROM role_permissions
JOIN permissions ON permissions.id = role_permissions.permission_id
WHERE UPPER(REPLACE(permissions.permission_name, ' ', '_')) = 'EDIT_PARKING';

DELETE FROM permissions
WHERE UPPER(REPLACE(permission_name, ' ', '_')) = 'EDIT_PARKING';
