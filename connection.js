
const mysql = require('mysql');

var mysqlConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Razaaq@5',
    database: 'Authentication',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log('Connection Success!');
    }
    else {
        console.log('error connecting!');
    }
});

module.exports = mysqlConnection;