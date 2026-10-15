INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.permission_name IN (
    'ADD PARKING',
    'VIEW_PARKING',
    'VIEW_OWN_PARKING_RECORDS'
)
WHERE roles.roles_name = 'Parker'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_permissions.role_id = roles.id
        AND role_permissions.permission_id = permissions.id
  );

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.permission_name IN (
    'ADD PARKING',
    'VIEW_PARKING',
    'VIEW_PARKING_RECORDS',
    'VIEW_ROLES',
    'EXIT_PARKING'
)
WHERE roles.roles_name = 'Manager'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_permissions.role_id = roles.id
        AND role_permissions.permission_id = permissions.id
  );
