USE company_DB;

INSERT INTO department (name) 
VALUES ('Management'),('Engineering'),('Sales'),('Legal'),('Finance');

INSERT INTO employeeRole (title, salary, department_id, department_name)
VALUES ('Manager', '150000', 0, ''),('Lead Engineer', 150000,1,'Engineering'),('Salesperson',80000,2,'Sales'),('Software Engineer',120000,1,'Engineering'),('Accountant',125000,4,'Finance'),('Lawyer',190000,3,'Legal');


