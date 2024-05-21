const path = require('path');
var mysql=require("mysql");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');


const app = express();
app.use(cookieParser());
app.use(session({
  secret: 'gizli anahtar',
  resave: false,
  saveUninitialized: true
}));

var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"password",
});
connection.connect(function(err){
    if(err) {
        throw err;
    }else  {
        console.log("connected..");
    }
})

const homeRouter = require("./routes/index");
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("", homeRouter);
app.listen(8001, async()=>{
    console.log("8001 listening");
})
