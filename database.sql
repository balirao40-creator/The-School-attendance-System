```sql
CREATE DATABASE IF NOT EXISTS aspire_attendance;

USE aspire_attendance;

CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(20)
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    roll_number VARCHAR(30) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(30) NOT NULL,
    parent_email VARCHAR(100),
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    remarks VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
);

CREATE TABLE alert_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    alert_type ENUM('SMS', 'Voice Call') NOT NULL,
    parent_phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
);

INSERT INTO classes
(class_name, section, teacher_name, room_number)
VALUES
('Playgroup', 'A', 'Sir Imran', '101'),
('Nursery', 'A', 'Sir Imran', '102'),
('Prep / KG', 'A', 'Sir Imran', '103'),
('Grade 1', 'A', 'Sir Imran', '104'),
('Grade 2', 'A', 'Sir Imran', '105'),
('Grade 3', 'A', 'Sir Imran', '106'),
('Grade 4', 'A', 'Sir Imran', '107'),
('Grade 5', 'A', 'Sir Imran', '108'),
('Grade 6', 'A', 'Sir Imran', '109'),
('Grade 7', 'A', 'Sir Imran', '110'),
('Grade 8', 'A', 'Sir Imran', '111'),
('Grade 9', 'A', 'Sir Imran', '112'),
('Grade 10', 'A', 'Sir Imran', '113');
```
