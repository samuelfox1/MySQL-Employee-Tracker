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
    home();
});


function home() {
    console.log('\n========================== HOME ==========================\n')
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to add?",
                choices: ['Add Employee', 'Add Role', 'Add Department', 'QUIT'],
                name: 'choice'
            }
        ]).then(({ choice }) => {
            switch (choice) {
                case 'Add Employee':
                    return addEmployee();
                case 'Add Role':
                    return addRole();
                case 'Add Department':
                    return addDepartment();
                default:
                    console.log('\n======================== GOODBYE =========================\n')
                    return connection.end();
            }
        })

}

function addEmployee() {
    console.log('\n======================== EMPLOYEE ========================\n')
    home()
}
function addRole() {
    console.log('\n========================== ROLE ==========================\n')
    home()
}
function addDepartment() {
    console.log('\n======================= DEPARTMENT =======================\n')
    home()
}