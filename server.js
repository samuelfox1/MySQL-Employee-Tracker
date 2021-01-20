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
            choices: ['View All Employees', 'View All Departments', 'View Employee Roles', 'Add Employee', 'Add Departments', 'Add Employee Role', 'QUIT'],
            name: 'x'
        }]).then(({ x }) => {
            switch (x) {
                case 'View All Employees':
                    return viewEmployee();
                case 'View All Departments':
                    return viewDepartment();
                case 'View Employee Roles':
                    return viewRole();
                case 'Add Employee':
                    return addEmployee();
                case 'Add Departments':
                    return addDepartment()
                case 'Add Employee Role':
                    return addRole();
                // case '':
                //     return
                // case '':
                //     return
                default:
                    console.log('\n------------------------ GOODBYE -------------------------\n')
                    return connection.end();
            }
        })
}


function viewEmployee() {
    console.log('\n--------------------- VIEW EMPLOYEES ---------------------')
    connection.query("SELECT * FROM employee", (err, results) => {
        if (err) throw err;
        console.table(results)
        home()
    })
}
function addEmployee() {
    console.log('\n---------------------- ADD EMPLOYEE ----------------------')
    home()
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
function viewRole() {
    console.log('\n----------------------- VIEW ROLES -----------------------')
    connection.query("SELECT * FROM employeeRole", (err, results) => {
        if (err) throw err;
        console.table(results)
        home()
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
function viewDepartment() {
    console.log('\n-------------------- VIEW DEPARTMENTS --------------------')
    connection.query("SELECT * FROM department", (err, results) => {
        if (err) throw err;
        console.table(results)
        home()
    })
}


