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
    console.log('\n====== WELCOME!===========================================')
    home();
});


function home() {
    console.log('\n========================== HOME ==========================\n')
    console.log(`!! IMPORTANT !!\n\nSTART by adding all departments\nTHEN add all employee role's\nEND with adding employees\n`)
    inquirer
        .prompt([{
            type: "list",
            message: "What would you like to do?",
            choices: ['Add Department', 'Add Role', 'Add Employee', 'QUIT'],
            name: 'choice'
        }]).then(({ choice }) => {
            switch (choice) {
                case 'Add Department':
                    return addDepartment();
                case 'Add Role':
                    return addRole();
                case 'Add Employee':
                    return addEmployee();
                default:
                    console.log('\n======================== GOODBYE =========================\n')
                    return connection.end();
            }
        })

}

function addEmployee() {
    console.log('\n======================== EMPLOYEE ========================')
    home()
}


function addRole() {
    console.log('\n========================== ROLE ==========================')
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


function addDepartment() {
    console.log('\n======================= DEPARTMENT =======================')
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