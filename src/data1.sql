USE parking_db;

CREATE TABLE roles(
    id INT AUTO_INCREMENT PRIMARY KEY,
    roles_name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO roles (roles_name)
VALUES ('Parker'), ('Manager');

CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    age INT,
    password VARCHAR(100) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

SELECT * FROM users;
SELECT DATABASE();
INSERT INTO users
(name, email, role_id, age, password)
VALUES
('Rahul', 'rahul@gmail.com', (SELECT id FROM roles WHERE roles_name = 'Parker'), 24, 'rahul123'),
('Priya', 'priya@gmail.com', (SELECT id FROM roles WHERE roles_name = 'Parker'), 25, 'priya123'),
('Arun', 'arun@gmail.com', (SELECT id FROM roles WHERE roles_name = 'Manager'), 23, 'arun123'),
('Sneha', 'sneha@gmail.com', (SELECT id FROM roles WHERE roles_name = 'Manager'), 26, 'sneha123');

DESCRIBE users;
SHOW COLUMNS FROM users;



SHOW DATABASES;

CREATE TABLE role_permissions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    
    FOREIGN KEY (role_id)
		REFERENCES roles(id)
        ON DELETE CASCADE,
        
         FOREIGN KEY (permission_id)
		REFERENCES permissions(id)
        ON DELETE CASCADE,
        UNIQUE(role_id,permission_id)
        );
  SHOW TABLES;
  INSERT INTO permissions
  (permission_name)
  VALUES
  ('PARKING_VIEW'),
  ('PARKING_RECORD_VIEW'),
  ('PARKING_RECORD_ADD'),
  ('PARKING_RECORD_EXIT'),
    ('PARKING_RECORD_DELETE'),
    ('VIEW_ROLES');

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT roles.id, permissions.id
    FROM roles
    JOIN permissions ON permissions.permission_name = 'VIEW_ROLES'
    WHERE roles.roles_name = 'Manager';

        INSERT INTO permissions (permission_name)
        SELECT 'VIEW_PARKING_RECORDS'
        WHERE NOT EXISTS (
                SELECT 1 FROM permissions WHERE permission_name = 'VIEW_PARKING_RECORDS'
        );

        DELETE role_permissions
        FROM role_permissions
        JOIN roles ON roles.id = role_permissions.role_id
        JOIN permissions ON permissions.id = role_permissions.permission_id
        WHERE roles.roles_name = 'Parker'
            AND permissions.permission_name IN ('VIEW_PARKING_RECORDS', 'PARKING_RECORD_VIEW');

        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles.id, permissions.id
        FROM roles
        JOIN permissions ON permissions.permission_name = 'VIEW_PARKING_RECORDS'
        WHERE roles.roles_name = 'Manager'
            AND NOT EXISTS (
                    SELECT 1
                    FROM role_permissions
                    WHERE role_permissions.role_id = roles.id
                        AND role_permissions.permission_id = permissions.id
            );

  SELECT * FROM Permissions;
  describe permissions;
  describe ROLE_permissions;
  describe roles;
  
  SELECT id, permission_name
  FROM  permissions
  order by permission_name;
  