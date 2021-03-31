let mysql = require('mysql');
let express = require('express');
let app = express();
app.use(express.urlencoded({ extended: false }))
const util = require('util')

// parse application/json
app.use(express.json())


let mysqlConnection = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "root1",
    database: "coursesdb"
});

app.get('/classes/:classId', (req, res) => {
    try {
        const classId = req.params.classId;
        console.log(classId)
        mysqlConnection.query(`SELECT 
    StudentName, SubjectName, StaffName
FROM
	coursesdb.classroom cls
    join coursesdb.students std on std.classID = cls.classID
    join coursesdb.subject sub on sub.classID = cls.classID
    join coursesdb.faculty fac on fac.classId = cls.classID
WHERE cls.classID =${classId};`, (err, records) => {
            if (err) throw err;
            else
                res.send(records);
        })
    } catch (error) {
        console.log(error);
    }
});

//update
app.put('/staff/:staffId', (req, res) => {
    const staffId = req.params.staffId;
    const { staffName } = req.body;
    // TODO check staff exists
    // TODO if not exist send response 400 with message bad request or staff not found
    // TODO If exist update the record and fetch the record and send it in response
    mysqlConnection.query(`update coursesdb.faculty set StaffName = '${req.body.StaffName}' where 
        StaffID =${req.body.StaffID}`, (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Failed to update the staff details due to techical difficulties!!' });
        } else {
            res.send({ update: "success" });
        }
    })
});

//insert
app.post("/subjects", (req, res) => {
    // TODO check duplicates
    mysqlconnection.query(`insert into coursesdb.subject(SubjectName) values(
                            ${req.body.SubjectName}`, (err, result) => {
        if (err) throw err; //chage
        else {
            res.send({ insert: "success" });
        }
    })
});

mysqlConnection.connect((err) => {
    if (err) {
        console.log('DB connction failed \n Error :' + util.inspect(err, {
            depth: 5,
        }));
        process.exit(1)
    } else {
        console.log('DB connected Successfully');
        app.listen(3200, () => console.log('Express server runnning on port no: 3200'));
    }

});
