CREATE DATABASE IF NOT EXISTS exam_system DEFAULT CHARACTER SET utf8mb4;
USE exam_system;

CREATE TABLE user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin','teacher','student') NOT NULL DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subject (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE question (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subject_id BIGINT NOT NULL,
  type ENUM('single','multiple','judge','blank','essay') NOT NULL,
  content TEXT NOT NULL,
  options TEXT NULL,
  answer TEXT NOT NULL,
  difficulty TINYINT DEFAULT 3,
  FOREIGN KEY (subject_id) REFERENCES subject(id)
);

CREATE TABLE exam (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subject_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  duration INT NOT NULL COMMENT '分钟',
  total_score INT NOT NULL DEFAULT 100,
  created_by BIGINT,
  FOREIGN KEY (subject_id) REFERENCES subject(id)
);

CREATE TABLE exam_question (
  exam_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 5,
  PRIMARY KEY (exam_id, question_id)
);

CREATE TABLE attempt (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  exam_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  status ENUM('ongoing','submitted','graded') DEFAULT 'ongoing',
  score DECIMAL(6,2) DEFAULT 0,
  started_at DATETIME,
  submitted_at DATETIME,
  FOREIGN KEY (exam_id) REFERENCES exam(id),
  FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE attempt_answer (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  answer TEXT,
  is_correct TINYINT DEFAULT 0,
  FOREIGN KEY (attempt_id) REFERENCES attempt(id),
  FOREIGN KEY (question_id) REFERENCES question(id)
);
