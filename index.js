let mysql = require('mysql');
let express = require('express');
const util = require('util')
const { establishPoolConnection, getSqlConnction } = require('./db');

let app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

function responseBuilder(message, data, errors) {
    return {
        message: message,
        data: data,
        errors: errors,
    }
}

app.get('/classes/:classId', async (req, res) => {
    let mysqlConnection;
    const response = responseBuilder('Successfully fetched', [], []);
    try {
        const classId = req.params.classId;
        console.log(classId)
        mysqlConnection = await getSqlConnction();
        const result = await mysqlConnection.promise().query(`SELECT 
                    StudentName, SubjectName, StaffName
                FROM
                    classroom cls
                    join students std on std.classID = cls.classID
                    join subject sub on sub.classID = cls.classID
                    join faculty fac on fac.classId = cls.classID
                WHERE cls.classID =${classId};`);
        response.data = result[0]
    } catch (error) {
        console.log(error);
        response.errors.push({
            message: 'Failed to fetch details due to technical difficulties!!',
            errorCode: 'INTERNAL_SERVER_ERROR',
        })
    }
    if (mysqlConnection) {
        mysqlConnection.release();
    }
    if (response.errors.lenght) {
        res.status(400);
    }
    res.send(response);
});

//update
app.put('/staff/:staffId', async (req, res) => {
    let mysqlConnection;
    const response = responseBuilder('Successfully updated', {}, []);
    try {
        mysqlConnection = await getSqlConnction();
        const staffId = req.params.staffId;
        const { StaffName } = req.body;
        const [[result]] = await mysqlConnection.promise().query(`select StaffID from faculty where StaffID=${staffId}`);
        if (!result) {
            response.errors.push({
                message: 'Staff Not exists!!',
                errorCode: 'RECORD_NOT_FOUND'
            })
        } else {
            await mysqlConnection.promise().query(`update coursesdb.faculty set StaffName = '${StaffName}' where 
            StaffID = ${staffId}`);
            const [[result]] = await mysqlConnection.promise().query(`select * from faculty where StaffID = ${staffId}`);
            response.data = result;
        }
    } catch (error) {
        console.log(error);
        response.errors.push({
            message: 'Failed to fetch details due to technical difficulties!!',
            errorCode: 'INTERNAL_SERVER_ERROR',
        })
    }
    if (mysqlConnection) {
        mysqlConnection.release();
    }
    if (response.errors.lenght) {
        res.status(400);
    }
    res.send(response);
});

//insert
app.post("/subjects", async (req, res) => {
    let mysqlConnection;
    const response = responseBuilder('Successfully Inserted subject', {}, []);
    try {
        mysqlConnection = await getSqlConnction();
        const { SubjectName } = req.body;
        const [[result]] = await mysqlConnection.promise().query(`select SubID from subject where SubjectName='${SubjectName}'`)
        if (result) {
            response.errors.push({
                message: 'Subject Already exists!!',
                errorCode: 'DUPLICATE_RECORD'
            })
        } else {
            const [subject] = await mysqlConnection.promise().query(`insert into subject(SubjectName) values('${SubjectName}')`);
            const [[result]] = await mysqlConnection.promise().query(`select * from subject where SubID = ${subject.insertId}`);
            response.data = result;
        }
    } catch (error) {
        console.log(error);
        response.errors.push({
            message: 'Failed to fetch details due to technical difficulties!!',
            errorCode: 'INTERNAL_SERVER_ERROR',
        })
    }
    if (mysqlConnection) {
        mysqlConnection.release();
    }
    if (response.errors.lenght) {
        res.status(400);
    }
    res.send(response);
});


async function startApplication() {
    try {
        await establishPoolConnection();
        app.listen(3002, () => {
            console.log('Server started on port 3002')
        })
    } catch (e) {
        console.log(e);
        console.log('FAILED TO START APPLICATION')
        process.exit(1);
    }
}

startApplication();
