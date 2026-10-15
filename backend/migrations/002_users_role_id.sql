INSERT IGNORE INTO roles (roles_name)
SELECT DISTINCT TRIM(role)
FROM users
WHERE role IS NOT NULL
    AND TRIM(role) <> '';

ALTER TABLE users
    ADD COLUMN role_id INT NULL AFTER role;

UPDATE users
JOIN roles ON roles.roles_name = TRIM(users.role)
SET users.role_id = roles.id;

ALTER TABLE users
    MODIFY role_id INT NOT NULL,
    ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(id);

ALTER TABLE users
    DROP COLUMN role;