const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();


const app = express();
app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });
console.log("DB_USER:", process.env.DB_USER);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(error => {
    if (error) {
        console.error("Database connection failed:", error.message);
        return;
    }

    console.log("MySQL connected successfully");
});


app.get("/api/classes", (req, res) => {
    const sql = `
        SELECT
            id,
            class_name,
            section,
            teacher_name,
            room_number
        FROM classes
        ORDER BY id
    `;

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to load classes"
            });
        }

        res.json(results);
    });
});


app.get("/api/students", (req, res) => {
    const sql = `
        SELECT
            id,
            class_id,
            roll_number,
            student_name,
            gender,
            parent_name,
            parent_phone,
            parent_email
        FROM students
        ORDER BY id
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("STUDENTS API ERROR:", error);
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(results);
    });
});



app.post("/api/students", (req, res) => {
    const {
        classId,
        rollNumber,
        name,
        gender,
        parentName,
        parentPhone,
        parentEmail
    } = req.body;

    if (
        !classId ||
        !rollNumber ||
        !name ||
        !parentName ||
        !parentPhone
    ) {
        return res.status(400).json({
            error: "Required fields are missing"
        });
    }

    const sql = `
        INSERT INTO students
        (
            class_id,
            roll_number,
            student_name,
            gender,
            parent_name,
            parent_phone,
            parent_email
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        classId,
        rollNumber,
        name,
        gender || null,
        parentName,
        parentPhone,
        parentEmail || null
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to add student"
            });
        }

        res.json({
            message: "Student added successfully",
            id: result.insertId
        });
    });
});


app.post("/api/classes", (req, res) => {
    const {
        className,
        section,
        teacherName,
        roomNumber
    } = req.body;

    if (!className || !section || !teacherName) {
        return res.status(400).json({
            error: "Required fields are missing"
        });
    }

    const sql = `
        INSERT INTO classes
        (
            class_name,
            section,
            teacher_name,
            room_number
        )
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        className,
        section,
        teacherName,
        roomNumber || null
    ];

    db.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to add class"
            });
        }

        res.json({
            message: "Class added successfully",
            id: result.insertId
        });
    });
});


app.post("/api/attendance", (req, res) => {
    const {
        studentId,
        attendanceDate,
        status,
        remarks
    } = req.body;

    if (
        !studentId ||
        !attendanceDate ||
        !status
    ) {
        return res.status(400).json({
            error: "Required fields are missing"
        });
    }

    const findSql = `
        SELECT id
        FROM attendance
        WHERE student_id = ?
        AND attendance_date = ?
    `;

    db.query(
        findSql,
        [studentId, attendanceDate],
        (findError, results) => {

            if (findError) {
                return res.status(500).json({
                    error: "Failed to check attendance"
                });
            }

            if (results.length > 0) {

                const updateSql = `
                    UPDATE attendance
                    SET status = ?, remarks = ?
                    WHERE student_id = ?
                    AND attendance_date = ?
                `;

                db.query(
                    updateSql,
                    [
                        status,
                        remarks || null,
                        studentId,
                        attendanceDate
                    ],
                    updateError => {

                        if (updateError) {
                            return res.status(500).json({
                                error: "Failed to update attendance"
                            });
                        }

                        res.json({
                            message: "Attendance updated successfully"
                        });
                    }
                );

            } else {

                const insertSql = `
                    INSERT INTO attendance
                    (
                        student_id,
                        attendance_date,
                        status,
                        remarks
                    )
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [
                        studentId,
                        attendanceDate,
                        status,
                        remarks || null
                    ],
                    insertError => {

                        if (insertError) {
                            return res.status(500).json({
                                error: "Failed to save attendance"
                            });
                        }

                        res.json({
                            message: "Attendance saved successfully"
                        });
                    }
                );
            }
        }
    );
});


app.get("/api/attendance/:date", (req, res) => {
    const date = req.params.date;

    const sql = `
        SELECT
            attendance.id,
            attendance.student_id,
            attendance.attendance_date,
            attendance.status,
            attendance.remarks,
            students.student_name,
            students.roll_number,
            students.parent_name,
            students.parent_phone,
            students.class_id
        FROM attendance
        INNER JOIN students
        ON attendance.student_id = students.id
        WHERE attendance.attendance_date = ?
        ORDER BY students.roll_number
    `;

    db.query(sql, [date], (error, results) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to load attendance"
            });
        }

        res.json(results);
    });
});


app.get("/api/alerts", (req, res) => {
    const sql = `
        SELECT
            id,
            student_id,
            alert_type,
            parent_phone,
            message,
            status,
            created_at
        FROM alert_logs
        ORDER BY created_at DESC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error("ALERTS API ERROR:", error);
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(results);
    });
});
app.get("/api/test", (req, res) => {
    res.json({
        message: "NEW SERVER.JS IS WORKING"
    });
});



app.listen(process.env.PORT, () => {
    console.log(
        `Aspire Attendance System running on http://localhost:${process.env.PORT}`
    );
});
