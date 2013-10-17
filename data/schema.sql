DROP DATABASE web_historian;
CREATE DATABASE web_historian;
USE web_historian;
CREATE TABLE archive (url VARCHAR(1000), html VARCHAR(100000), stamp DATETIME);
