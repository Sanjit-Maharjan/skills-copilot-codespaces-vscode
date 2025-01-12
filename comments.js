// Create web server
var express = require('express');
var app = express();
// Create server
var server = require('http').createServer(app);
// Create socket
var io = require('socket.io').listen(server);
// Create mysql
var mysql = require('mysql');

// Create connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "comments"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Create table
var sql = "CREATE TABLE IF NOT EXISTS comments (name VARCHAR(255), comment TEXT)";
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

// Create route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Create connection
io.sockets.on('connection', function (socket) {
    // Get comments from database
    con.query("SELECT * FROM comments", function (err, result) {
        if (err) throw err;
        socket.emit('comments', result);
    });

    // Set comments
    socket.on('setComment', function (data) {
        // Insert comment to database
        con.query("INSERT INTO comments (name, comment) VALUES ('" + data.name + "', '" + data.comment + "')", function (err, result) {
            if (err) throw err;
            // Get comments from database
            con.query("SELECT * FROM comments", function (err, result) {
                if (err) throw err;
                io.sockets.emit('comments', result);
            });
        });
    });
});

// Create server
server.listen(3000, function () {
    console.log('Server running...');
});