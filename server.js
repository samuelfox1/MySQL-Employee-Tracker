const inquirer = require('inquirer')
const mysql = require('mysql')

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "company_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    console.log('\n----------- WELCOME TO MySQL EMPLOYEE TRACKER! -----------')
    home();
});

function home() {
    console.log('\n-------------------------- HOME --------------------------\n')
    inquirer
        .prompt([{
            type: 'list',
            message: 'What would you like to do?',
            choices: ['Add departments, roles, employees', 'View departments, roles, employees', 'QUIT'],
            name: 'x'
        }]).then(({ x }) => {
            switch (x) {
                case 'Add departments, roles, employees':
                    return addData();
                case 'View departments, roles, employees':
                    return viewData();
                default:
                    console.log('\n------------------------ GOODBYE -------------------------\n')
                    return connection.end();
            }
        })
}

function addData() {
    console.log('\n------------------------ ADD DATA ------------------------\n')
    console.log(`!! IMPORTANT !!\n\nSTART by adding all departments\nTHEN add all employee role's\nEND with adding employees\n`)
    inquirer
        .prompt([{
            type: "list",
            message: "What would you like to add?",
            choices: ['Department', 'Role', 'Employee', '<-- exit'],
            name: 'choice'
        }]).then(({ choice }) => {
            switch (choice) {
                case 'Department':
                    return addDepartment();
                case 'Role':
                    return addRole();
                case 'Employee':
                    return addEmployee();
                default:
                    return home();
            }
        })

}

function viewData() {
    console.log('\n----------------------- VIEW DATA ------------------------\n')
    inquirer
        .prompt([{
            type: 'list',
            message: 'What would you like to view?',
            choices: ['Departments', 'Roles', 'Employees', '<-- exit'],
            name: 'x'
        }]).then(({ x }) => {
            switch (x) {
                case 'Departments':
                    return viewDepartments();
                case 'Roles':
                    return viewRoles();
                case 'Employees':
                    return viewEmployees();
                default:
                    return home();
            }
        })
}


function addDepartment() {
    console.log('\n--------------------- ADD DEPARTMENT ---------------------')
    inquirer
        .prompt([
            {
                type: 'input',
                message: 'Enter a department name: ',
                name: 'departmentName'
            }
        ]).then(({ departmentName }) => {
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: departmentName
                },
                function (err) {
                    if (err) throw err;
                    console.log('\nDepartment created successfully!')
                    home()
                });
        })
}
function viewDepartments() {
    console.log('\n-------------------- VIEW DEPARTMENTS --------------------')
    viewData()
}


function addRole() {
    console.log('\n--------------------- ADD ROLE ------------------------')
    connection.query("SELECT * FROM department", (err, results) => {
        if (err) throw err;


        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Enter role title: ',
                    name: 'title'
                }, {
                    type: 'input',
                    message: 'Enter role salary( numbers only, no commas ): ',
                    name: 'salary'
                }, {
                    type: 'list',
                    message: 'Select a department: ',
                    name: 'department',
                    choices: () => {
                        const choices = [];
                        for (let i = 0; i < results.length; i++) {
                            choices.push(results[i].name);
                        }
                        return choices;
                    }
                },
            ]).then((x) => {
                let dept;
                for (let i = 0; i < results.length; i++) {
                    if (results[i].name === x.department) { dept = results[i] }
                }
                connection.query(
                    'INSERT INTO employeeRole SET ?',
                    {
                        title: x.title,
                        salary: x.salary,
                        department_id: dept.id,
                        department_name: dept.name
                    },
                    function (err) {
                        if (err) throw err;
                        console.log('\nEmployee role created successfully!')
                        home()
                    });
            })
    });
}
function viewRoles() {
    console.log('\n----------------------- VIEW ROLES -----------------------')
    viewData()
}


function addEmployee() {
    console.log('\n---------------------- ADD EMPLOYEE ----------------------')
    home()
}
function viewEmployees() {
    console.log('\n--------------------- VIEW EMPLOYEES ---------------------')
    viewData()
}