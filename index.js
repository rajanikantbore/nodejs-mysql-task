let mysql = require('mysql');
let express = require('express');
let app = express();
let bodyparser = require('body-parser');
app.use(bodyparser.json);


let mysqlConnection = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "root1",
    database: "coursesdb"
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connected Successfully');
    else
        console.log('DB connction failed \n Error :' + JSON.stringify(err, undefined, 2));

});

app.listen(3200, () => console.log('Express server runnning on port no: 3200'));


app.get('/fetch', (req, res) => {
    mysqlConnection.query('SELECT * FROM coursesdb.classroom', (err, records) => {
        if (err) throw err;
        else
            res.send(records);
    })
});

//update
app.put('/update', (req, res) => {
    mysqlConnection.query(`update coursesdb.faculty set StaffName = '${req.body.StaffName}' where 
        StaffID =${req.body.StaffID}`, (err, result) => {
        if (err) throw err;
        else {
            res.send({ update: "success" });
        }
    })
});

//insert
app.post("/insert", (req, res) => {
    mysqlconnection.query(`insert into coursesdb.subject values(
                            ${req.body.SubID},
                            ${req.body.SubjectName},
                            ${req.body.classID})`, (err, result) => {
        if (err) throw err;
        else {
            res.send({ insert: "success" });
        }
    })
});

