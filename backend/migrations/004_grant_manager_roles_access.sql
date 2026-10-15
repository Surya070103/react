INSERT INTO permissions (permission_name)
SELECT required.permission_name
FROM (
  SELECT 'VIEW_DASHBOARD' AS permission_name
  UNION ALL SELECT 'VIEW_PARKING'
  UNION ALL SELECT 'VIEW_PARKING_RECORDS'
  UNION ALL SELECT 'VIEW_ROLES'
) AS required
WHERE NOT EXISTS (
  SELECT 1
  FROM permissions
  WHERE permissions.permission_name = required.permission_name
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON (
  (roles.roles_name = 'Parker' AND permissions.permission_name IN (
    'VIEW_PARKING'
  ))
  OR (roles.roles_name = 'Manager' AND permissions.permission_name IN (
    'VIEW_DASHBOARD', 'VIEW_PARKING', 'VIEW_PARKING_RECORDS', 'VIEW_ROLES'
  ))
)
WHERE roles.roles_name IN ('Parker', 'Manager')
  AND NOT EXISTS (
      SELECT 1
      FROM role_permissions
      WHERE role_permissions.role_id = roles.id
        AND role_permissions.permission_id = permissions.id
  );

  DELETE role_permissions
  FROM role_permissions
  JOIN roles ON roles.id = role_permissions.role_id
  JOIN permissions ON permissions.id = role_permissions.permission_id
  WHERE roles.roles_name = 'Parker'
    AND permissions.permission_name IN ('VIEW_PARKING_RECORDS', 'PARKING_RECORD_VIEW');