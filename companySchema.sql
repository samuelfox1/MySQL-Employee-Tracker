DROP DATABASE IF EXISTS company_DB;

CREATE DATABASE company_DB;

USE company_DB;

CREATE TABLE department(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE employeeRole(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary INT NOT NULL,
    department_id INT NOT NULL,
    department_name VARCHAR(30) NOT NULL
);

CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  title_id INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  manager_id INT UNSIGNED,
  manager_name VARCHAR(30) NOT NULL
);

INSERT INTO department (name) 
VALUES ('Management'),('Engineering'),('Sales'),('Legal'),('Finance');

INSERT INTO employeeRole (title, salary, department_id, department_name)
VALUES ('Manager', '150000', 1, 'Management'),('Lead Engineer', 150000,2,'Engineering'),('Salesperson',80000,3,'Sales'),('Software Engineer',120000,2,'Engineering'),('Accountant',125000,5,'Finance'),('Lawyer',190000,4,'Legal');
