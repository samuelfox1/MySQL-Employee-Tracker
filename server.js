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

// home menu launched at start
function home() {
    console.log('\n-------------------------- HOME --------------------------\n')
    inquirer
        .prompt([{
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View/Edit Employees', 'View/Edit Departments', 'View Employee Roles', 'Add Employee', 'Add Department', 'Add Employee Role', 'QUIT'],
            name: 'x'
        }]).then(({ x }) => {
            switch (x) {
                case 'View/Edit Employees':
                    return viewEmployees();
                case 'View/Edit Departments':
                    return viewDepartments();
                case 'View Employee Roles':
                    return viewRoles();
                case 'Add Employee':
                    return addNewEmployee();
                case 'Add Department':
                    return addNewDepartment()
                case 'Add Employee Role':
                    return addNewRole();
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



// __________________EMPLOYEE_FUNCTIONS___________________

// 1. Launches when 'View/Edit Employee' is selected form home menus.
// 2. Calls 'getAllEmployees()' to populate choices in inquirer prompt.
// 3. Calls 'editEmployees(xx)' when an employee is selected to edit content, 'xx' is the data object of the employee selected.
// 4. Calls 'home()' if '<--Exit' is selected.
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
            if (choice === '<--Exit') {
                home()
            }
            else {
                let match
                employees.forEach(x => { if (choice === `${x.first_name} ${x.last_name}`) { match = x } });
                editEmployee(match)
            }
        })
}

// 1. Returns a Promise containg an array of all employees form the database.
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

// 1. Initially takes in a data object of an employee to edit, when called from 'viewEmployees()'.
// 2. Calls 'promptEditEmployee()', prompting the user what they would like to edit for the employee.
// 3. Switch case for what 'selection' was returned from 'promptEditEmployee()'.
// 4. If employee data is edited, update the passed in'xx' object, write new data to the database, call it's self again with the updated 'xx' object.
// 5. Call 'home()' if '<--Exit' is selecteed
async function editEmployee(xx) {
    console.log('\n--------------------- EDIT EMPLOYEE ----------------------');
    console.log(xx)

    const editEmployeeChoice = await promptEditEmployee();

    if (editEmployeeChoice === 'Edit Name') {
        const enteredEmployeeName = await inputEmployeeName();
        let query = `UPDATE employee SET first_name = '${enteredEmployeeName.first}', last_name = '${enteredEmployeeName.last}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewEmployees() };
        })
    }
    else if (editEmployeeChoice === 'Edit Job Title') {
        const enteredRole = await selectEmployeeRole();
        let query = `UPDATE employee SET title_id = '${enteredRole.id}', title = '${enteredRole.title}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewEmployees() };
        })
    }
    else if (editEmployeeChoice === 'Change Manager') {
        const enteredManager = await selectEmployeeManager();
        let query = `UPDATE employee SET manager_id = '${enteredManager.id}', manager_name = '${enteredManager.name}'  WHERE id = ${xx.id}`
        console.log(query);
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewEmployees() };
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

// 1. Returns a Promise containg a string with the selected option of what to edit for the selected employee.
// 2. Calls 'home()' if '<--Exit' is selected.
function promptEditEmployee() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'What would you like to do?',
                name: 'x',
                choices: ['Edit Name', 'Edit Job Title', 'Change Manager', 'Delete Employee', '<--Exit']
            }]).then(({ x }) => {
                if (x === '<--Exit') { home() } else { resolve(x) }
            })
    })
}

// 1. Called when 'Add Employee' is selected from the 'home()' menue.
// 2. Calls 'inputEmployeeName()' to gather user input data.
// 3. Calls 'selectEmployeeRole()' to gather user input data.
// 4. Calls 'selectEmployeeManager()' to gather user input data.
// 5. INSERTS new employee data into the employee table.
async function addNewEmployee() {
    console.log('\n---------------------- ADD EMPLOYEE ----------------------');

    const employeeName = await inputEmployeeName();
    const employeeRole = await selectEmployeeRole();
    const employeeManager = await selectEmployeeManager();
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

// 1. Returns a Promise containing a object of name data collected from user input.
function inputEmployeeName() {
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
            }]).then(x => { resolve(x) })
    })
}

// 1. Calls 'getRoles()' to get a list of available options.
// 2. Returns a Promise containing a data object of first & last name collected from user input.
async function selectEmployeeRole() {
    const employeeRoles = await getRoles();

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

// 1. Calls 'getEmployeeManagers()' to get a list of available options.
// 2. Returns a Promise containing a data object of the manager the user selected.
// 3. Also allows user to select themselves as a manager, issuing an id of 0.
async function selectEmployeeManager() {
    const managerList = await getEmployeeManagers();
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

// 1. Called by 'selectEmployeeManager()' when adding or editing employee data.
// 2. Returns a Promise containing a data object of available managers.
function getEmployeeManagers() {
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


// _________________DEPARTMENT_FUNCTIONS__________________

// 1. Called from 'home()' & 'editDepartments()'
// 2. Calls 'getDepartments()' to collect data from database.
// 3. Prompts user for which department to edit,
// 4. Calls 'editDepartment(match)' passing in the 'match' object containing the data of the selected department.
// 5. Calls 'home()' if '<--Exit' is selected.
async function viewDepartments() {
    console.log('\n-------------------- VIEW DEPARTMENTS --------------------')

    const departments = await getDepartments();
    console.table(departments)
    inquirer
        .prompt([{
            type: 'list',
            message: 'Choose a department to edit:',
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


// 1. Called by 'viewDepartments()'
// 2. Returns a Promise containing an obect of data for each department in the database.
function getDepartments() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM department", (err, results) => {
            if (err) { reject('failed to get departments') };
            resolve(results)
        })
    })
}

// 1. Called by 'viewDepartments()' passing in the 'match' object of selected department.
// 2. Calls 'promptEditDepartment()' to gather a selction from the user.
// 3. Handles switch cases depending on user selection.
async function editDepartment(xx) {
    console.log('\n-------------------- EDIT DEPARTMENTS --------------------')

    const editDepartmentChoice = await promptEditDepartments();

    // if selected, gather input from user, update data in 'xx' object, update database, return to 'editDepartment(xx)' with updated 'xx' data
    if (editDepartmentChoice === 'Change Department Name') {
        const enteredDepartmentName = await inputDepartmentName()
        let query = `UPDATE department SET name = '${enteredDepartmentName}' WHERE id = ${xx.id}`
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewDepartments() };
        })
    }
    // if selected, prompt user to confirm, if yes: delete 'xx' object from database, return to 'viewDepartments()'
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

// 1. Called when user needs to input a Department name
// 2. Returns a Promise containing a string of the user's input.
function inputDepartmentName() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                message: 'Enter Department name:',
                name: 'x'
            }]).then(({ x }) => { resolve(x) })
    })
}

// 1. Called from 'home()' when user selects 'Add Department'.
// 2. Calls 'inputDepartmentName()' to gather data from user.
// 3. INSERTS new title into the department table in database.
async function addNewDepartment() {
    console.log('\n--------------------- ADD DEPARTMENT ---------------------')

    const newDepartmentName = await inputDepartmentName()
    let query = `INSERT INTO department SET name = '${newDepartmentName}'`
    connection.query(query, (err, res) => {
        if (err) { throw err }
        else { home() }
    });
}

// 1. Called by 'editDepartment(xx)' to gather input from the user.
// 2. Returns a Promise contating a string of the users selection.
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



// ____________________ROLE_FUNCTIONS_____________________

// 1. Called from 'home()' & 'editRole()' when selected by user.
// 2. Calls 'getRoles()' to collect data from database.
// 3. Prompts user which role to edit.
// 4. Calls 'editRoles(match)' passing in the 'match' object containing the data of the selected role.
// 5. Calls 'home()' if '<--Exit' is selected.
async function viewRoles() {
    console.log('\n----------------------- VIEW ROLES -----------------------')

    const roles = await getRoles();
    console.table(roles)
    inquirer
        .prompt([{
            type: 'list',
            message: 'Choose a role to edit data',
            name: 'choice',
            choices: () => {
                let choices = []
                roles.forEach(x => {
                    choices.push(x.title)
                });
                choices.push('<--Exit')
                return choices
            }
        }]).then(({ choice }) => {
            if (choice === '<--Exit') { home() }
            else {
                let match
                roles.forEach(x => { if (x.title === choice) { match = x } });
                editRole(match)
            }
        })
}

// 1. Called by 'viewRoles()'
// 2. Returns a Promise containing an obect of data for each role in the database.
function getRoles() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM employeeRole', (err, results) => {
            let title = []
            if (err) throw err;
            results.forEach(x => { title.push(x) });
            resolve(title)
            reject('failed gathering employee roles')
        })
    })
}

// 1. Called by 'viewtRole()' passing in the 'match' object of selected role.
// 2. Calls 'promptEditRole()' to gather a selction from the user.
// 3. Handles switch cases depending on user selection.
async function editRole(xx) {
    console.log('\n----------------------- EDIT ROLES -----------------------')

    const editRoleChoice = await promptEditRoles();

    // if selected, gather input from user & update data in 'xx' object
    // update database & return to 'editRole(xx)' with updated 'xx' data
    if (editRoleChoice === 'Edit Role Title') {
        const roleName = await inputRoleName()
        let query = `UPDATE employeeRole SET title = '${roleName}' WHERE id = ${xx.id}`
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewRoles() };
        })
    }
    // if selected, gather input from user & update data in 'xx' object
    // update database & return to 'editRole(xx)' with updated 'xx' data
    else if (editRoleChoice === 'Edit Role Salary') {
        const roleSalary = await inputRoleSalary();
        let query = `UPDATE employeeRole SET salary = '${roleSalary}' WHERE id = ${xx.id}`
        connection.query(query, (err, res) => {
            if (err) { throw err }
            else { viewRoles() };
        })
    }
    // if selected, prompt user to confirm
    // if yes: delete 'xx' object from database & return to 'viewRoles()'
    else if (editRoleChoice === 'Delete Role') {
        inquirer.prompt([{
            type: 'list',
            message: `Are you sure? DELETE '${xx.title}' ???`,
            name: 'x',
            choices: ['yes', 'NO']
        }]).then(({ x }) => {
            switch (x) {
                case 'yes':
                    let query = `DELETE FROM employeeRole WHERE id = '${xx.id}'`
                    connection.query(query, (err, res) => {
                        if (err) { throw err }
                        else { viewRoles() };
                    })
                    break
                default:
                    return editRole(xx)
            }
        })
    }
}

// 1. Called by 'editRole(xx)' to gather input from the user.
// 2. Returns a Promise contating a string of the users selection.
function promptEditRoles() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'What would you like to do?',
                choices: ['Edit Role Title', 'Edit Role Salary', 'Delete Role', '<--Exit'],
                name: 'x'
            }]).then(({ x }) => {
                if (x === '<--Exit') { home() } else { resolve(x) }
            })
    })
}

// 1. Called when user needs to input a Role name
// 2. Returns a Promise containing a string of the user's input.
function inputRoleName() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                message: 'Enter Role Title:',
                name: 'x'
            }]).then(({ x }) => { resolve(x) })
    })
}

function inputRoleSalary() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'number',
                message: 'Enter Role Salary (numbers only, no commas):',
                name: 'x'
            }]).then(({ x }) => { resolve(x) })
    })
}

async function addNewRole() {
    console.log('\n------------------------ ADD ROLE ------------------------')

    const newRoleName = await inputRoleName();
    const newRoleSalary = await inputRoleSalary();
    const newRoleDepartment = await inputRoleDepartment();

    let query = `INSERT INTO employeeRole SET title = '${newRoleName}', salary = ${newRoleSalary}, department_id = ${newRoleDepartment.id}, department_name = '${newRoleDepartment.name}'`
    connection.query(query, (err, res) => {
        if (err) { throw err }
        else { home() }
    });
}

// 1. Called by 'addNewRole()'
// 2. Returns a Promise containing an obect of data for selected department in the database.
async function inputRoleDepartment() {
    const selectedRoleDepartment = await getDepartments();
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                message: 'Choose a department:',
                name: 'choice',
                choices: () => {
                    let choices = []
                    selectedRoleDepartment.forEach(x => {
                        choices.push(x.name)
                    });
                    return choices
                }
            }]).then(({ choice }) => {
                let match
                selectedRoleDepartment.forEach(x => { if (x.name === choice) { match = x } });
                resolve(match)
            })
    })
}