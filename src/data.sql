CREATE DATABASE parking_db;
USE parking_db;
SELECT * FROM parking;

SHOW COLUMNS FROM parking LIKE 'amount';
SHOW COLUMNS FROM parking_db.parking
LIKE 'vehicle_type';

CREATE TABLE  parking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    slot_number VARCHAR(10) NOT NULL,
    entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME NULL DEFAULT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PARKED'
);
ALTER TABLE parking_db.parking
ADD COLUMN vehicle_type VARCHAR(20);
ALTER TABLE parking
ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL;    
    SELECT DATABASE();
SHOW DATABASES;
DESCRIBE parking_db.parking;
    SHOW TABLES;
    
    CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roles_name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    age INT,
    manager VARCHAR(50) NOT NULL,
    parker VARCHAR(50) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
    
   
    
    