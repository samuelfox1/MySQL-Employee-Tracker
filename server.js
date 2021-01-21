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
    console.log('\n----------- WELCOME TO MySQL EMPLOYEE TRACKER ------------')
    home();
});

function home() {
    console.log('\n-------------------------- HOME --------------------------\n')
    inquirer
        .prompt([{
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View/Edit Employees', 'View/Edit Departments', 'View Employee Roles', 'Add Employee', 'Add Departments', 'Add Employee Role', 'QUIT'],
            name: 'x'
        }]).then(({ x }) => {
            switch (x) {
                case 'View/Edit Employees':
                    return viewEmployees();
                case 'View/Edit Departments':
                    return viewDepartments();
                case 'View Employee Roles':
                    return viewExistingRoles();
                case 'Add Employee':
                    return addNewEmployee();
                case 'Add Departments':
                    return addNewDepartment()
                case 'Add Employee Role':
                    return createNewRole();
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




async function viewEmployees() {
    console.log('\n--------------------- VIEW EMPLOYEES ---------------------')

    const employees = await getAllEmployees()
    console.table(employees)

    inquirer
        .prompt([
            {
                type: 'list',
                message: 'Choose an employee to edit data.',
                name: 'choice',
                choices: () => {
                    let choices = []
                    employees.forEach(x => {
                        let name = `${x.first_name} ${x.last_name}`
                        choices.push(name)
                    });
                    choices.push('<--Exit')
                    return choices
                }
            }
        ]).then(({ choice }) => {
            if (choice === '<--Exit') { home() }
            else {
                let match
                employees.forEach(x => { if (choice === `${x.first_name} ${x.last_name}`) { match = x } });
                editEmployee(match)
            }
        })
}

async function addNewEmployee() {
    console.log('\n---------------------- ADD EMPLOYEE ----------------------');

    const employeeName = await addEmployeeName();
    const employeeRole = await addEmployeeRole();
    const employeeManager = await addEmployeeManager();
    connection.query(
        'INSERT INTO employee SET ?',
        {
            first_name: employeeName.first,
            last_name: employeeName.last,
            title_id: employeeRole.id,
            title: employeeRole.title,
            manager_id: employeeManager.id,
            manager_name: employeeManager.name
        },
        (err) => {
            if (err) throw err;
            home()
        }
    );
}

async function editEmployee(xx) {
    console.log('\n--------------------- EDIT EMPLOYEE ----------------------');
    console.log(xx)

    const editEmployeeChoice = await promptEditEmployee();

    if (editEmployeeChoice === 'Edit Name') {
        const enteredEmployeeName = await addEmployeeName();
        xx.first_name = enteredEmployeeName.first;
        xx.last_name = enteredEmployeeName.last;
        let query = `UPDATE employee SET first_name = '${xx.first_name}', last_name = '${xx.last_name}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { editEmployee(xx) };
        })
    }
    else if (editEmployeeChoice === 'Edit Job Title') {
        const enteredRole = await addEmployeeRole();
        xx.title_id = enteredRole.id;
        xx.title = enteredRole.title;
        let query = `UPDATE employee SET title_id = '${xx.title_id}', title = '${xx.title}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { editEmployee(xx) };
        })
    }
    else if (editEmployeeChoice === 'Change Manager') {
        const enteredManager = await addEmployeeManager();
        xx.manager_id = enteredManager.id
        xx.manager_name = enteredManager.name
        let query = `UPDATE employee SET manager_id = '${xx.manager_id}', manager_name = '${xx.manager_name}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { editEmployee(xx) };
        })
    }
    else if (editEmployeeChoice === 'Delete Employee') {
        inquirer.prompt([{
            type: 'list',
            message: `Are you sure? DELETE '${xx.first_name} ${xx.last_name}' ???`,
            name: 'x',
            choices: ['yes', 'NO']
        }]).then(({ x }) => {
            switch (x) {
                case 'yes':
                    let query = `DELETE FROM employee WHERE id = '${xx.id}'`
                    connection.query(query, (err, res) => {
                        if (err) { throw err }
                        else { viewEmployees() };
                    })
                    break
                default:
                    return editEmployee(xx)
            }
        })
    }
}

function promptEditEmployee() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'What would you like to do?',
                name: 'x',
                choices: ['Edit Name', 'Edit Job Title', 'Change Manager', 'Delete Employee', '<-- Exit']
            }]).then(({ x }) => {
                if (x === '<--Exit') { home() } else { resolve(x) }
            })
    })
}

function addEmployeeName() {
    console.log('employee name')
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                message: 'Enter first name:',
                name: 'first'
            }, {
                type: 'input',
                message: 'Enter last name:',
                name: 'last'
            }]).then(x => {
                let obj = {
                    first: x.first,
                    last: x.last
                }
                resolve(obj)
            })
    })
}

async function addEmployeeRole() {
    const employeeRoles = await getEmployeeRoles();

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'Select a role: ',
                name: 'selection',
                choices: () => {
                    let choices = [];
                    employeeRoles.forEach(x => { choices.push(x.title) });
                    return choices;
                }
            }
            ]).then(({ selection }) => {
                let role
                employeeRoles.forEach(z => { if (z.title === selection) { role = z } });
                resolve(role)
            })
    })
}

async function addEmployeeManager() {
    const managerList = await getManagers();
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'Assign a Manager',
                name: 'selection',
                choices: () => {
                    let choices = ['self']
                    managerList.forEach(x => { choices.push(x.name) });
                    return choices;
                }
            }]).then(({ selection }) => {
                let manager
                managerList.forEach(x => {
                    if (x.name === selection) { manager = x }
                });
                if (selection === 'self') {
                    manager = {
                        id: 0,
                        name: `self`
                    }
                }
                resolve(manager)
            })
    })
}

function getAllEmployees() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM employee", (err, results) => {
            let employees = []
            if (err) throw err;
            // console.log(results)
            results.forEach(x => { employees.push(x) });
            resolve(employees)
            reject('failed gathering employees')
        })

    })
}




async function viewDepartments() {
    console.log('\n-------------------- VIEW DEPARTMENTS --------------------')

    const departments = await getDepartments();
    console.table(departments)
    inquirer
        .prompt([{
            type: 'list',
            message: 'Choose a department to edit data',
            name: 'choice',
            choices: () => {
                let choices = []
                departments.forEach(x => {
                    choices.push(x.name)
                });
                choices.push('<--Exit')
                return choices
            }
        }]).then(({ choice }) => {
            if (choice === '<--Exit') { home() }
            else {
                let match
                departments.forEach(x => { if (x.name === choice) { match = x } });
                editDepartment(match)
            }
        })
}

async function editDepartment(xx) {
    console.log('\n-------------------- EDIT DEPARTMENTS --------------------')

    const editDepartmentChoice = await promptEditDepartments();

    if (editDepartmentChoice === 'Change Department Name') {
        const enteredDepartmentName = await addDepartmentName()
        xx.name = enteredDepartmentName
        console.log(xx)
        let query = `UPDATE department SET name = '${xx.name}' WHERE id = ${xx.id}`
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { editDepartment(xx) };
        })
    }
    else if (editDepartmentChoice === 'Delete Department') {
        inquirer.prompt([{
            type: 'list',
            message: `Are you sure? DELETE '${xx.name}' ???`,
            name: 'x',
            choices: ['yes', 'NO']
        }]).then(({ x }) => {
            switch (x) {
                case 'yes':
                    let query = `DELETE FROM department WHERE id = '${xx.id}'`
                    connection.query(query, (err, res) => {
                        if (err) { throw err }
                        else { viewDepartments() };
                    })
                    break
                default:
                    return editDepartment(xx)
            }
        })
    }
}

function addDepartmentName() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                message: 'Enter Department name:',
                name: 'x'
            }]).then(({ x }) => { resolve(x) })
    })
}

async function addNewDepartment() {
    console.log('\n--------------------- ADD DEPARTMENT ---------------------')

    const newDepartmentName = await addDepartmentName()
    let query = `INSERT INTO department SET name = '${newDepartmentName}'`
    connection.query(query, (err, res) => {
        if (err) { throw err }
        else { home() }
    });
}


function promptEditDepartments() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'What would you like to do?',
                choices: ['Change Department Name', 'Delete Department', '<--Exit'],
                name: 'x'
            }]).then(({ x }) => {
                if (x === '<--Exit') { home() } else { resolve(x) }
            })
    })
}

function getDepartments() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM department", (err, results) => {
            if (err) { reject('failed to get departments') };
            resolve(results)
        })
    })
}




function createNewRole() {
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

function getEmployeeRoles() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM employeeRole', (err, results) => {
            let title = []
            // console.log('test')
            if (err) throw err;
            results.forEach(x => {
                title.push(x)
            });
            // console.log(title)
            resolve(title)
            // reject('failed gathering employee roles')
        })
    })
}

function getManagers() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT id, first_name, last_name FROM employee WHERE title_id = 1', (err, results) => {
            let managers = []
            if (err) throw err;
            // console.log(results)
            for (let i = 0; i < results.length; i++) {
                let x = results
                let obj = {
                    id: x[i].id,
                    name: `${x[i].first_name} ${x[i].last_name}`
                }
                managers.push(obj)
            }
            resolve(managers)
            // reject('failed gathering employee managers')
        })
    })
}