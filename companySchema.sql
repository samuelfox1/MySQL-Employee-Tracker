DROP DATABASE IF EXISTS company_DB;

CREATE DATABASE company_DB;

USE company_DB;

CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT UNSIGNED
);

CREATE TABLE employeeRole(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary INT NOT NULL,
    department_id INT NOT NULL,
    department_name VARCHAR(30) NOT NULL
);

CREATE TABLE department(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

INSERT INTO department (name) 
VALUES ('Product Development'),('Marketing'),('HR');