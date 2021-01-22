USE company_DB;

INSERT INTO department (name) 
VALUES 
('Management'),
('Engineering'),
('Sales'),
('Legal'),
('Finance');

INSERT INTO employeeRole (title, salary, department_id, department_name)
VALUES 
('Manager', '150000', 1, 'Management'),
('Lead Engineer', 150000, 2,'Engineering'),
('Software Engineer',120000, 2,'Engineering'),
('Salesperson', 80000, 3,'Sales'),
('Lawyer',190000, 4,'Legal'),
('Accountant',125000, 5,'Finance');