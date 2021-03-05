const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
var ejs = require('ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const extroutes = require('./routes.js');
app.use('/', extroutes);

app.listen(4000, () => {
    console.log("Server is up and Running!");
});