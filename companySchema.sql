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
VALUES ('Engineering'),('Sales'),('Legal'),('Finance');

INSERT INTO employeeRole (title, salary, department_id, department_name)
VALUES ('Manager', '150000', 0, ''),('Lead Engineer', 150000,1,'Engineering'),('Salesperson',80000,2,'Sales'),('Software Engineer',120000,1,'Engineering'),('Accountant',125000,4,'Finance'),('Lawyer',190000,3,'Legal');

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 3, 0),('Ashley', 'Rodriguez', 2, 0);