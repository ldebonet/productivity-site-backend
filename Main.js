const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

db = new sqlite3.Database("./database.db");

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


app.use(session({
  key: 'dfgl',
  secret: 'wret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: (1825 * 86400 * 1000),
    //httpOnly: false
    //domain: 'u6527.csb.app'
    secure: false
  }
}));

app.get('/', (req, res) => {
  res.send('Hello, world!');
  console.log("Getted");
});

app.use(express.json());
app.post('/login', (req, res) => {
  console.log("SESSION ID: " + req.session.id);
  let username = req.body.username;
  let password = req.body.password;

  let cols = [username];
  db.get('SELECT * FROM users WHERE username = ?', cols, (err, data) => {

    if (err){
      res.json({
        success: false,
        msg: 'An error occurred. Please try again.'
      });
      console.log("SQL err: " + err);
      return;
    }

    if (data){
      bcrypt.compare(password, data.password, (bcryptErr, verified) => {
        if (verified) {
          req.session.userID = data.id;
          req.session.save();
          console.log("User Found: " + JSON.stringify(data));
          console.log("Saved: " + JSON.stringify(req.session));
          res.json({
            success: true,
            username: data.username
          });

          return;
        }

        else{
          res.json({
            success: false,
            msg: 'Invalid Password'
          });
          console.log("Invalid Password for " + data.username);
          return;
        }

      });
    }
    else {
      res.json({
            success: false,
            msg: 'User not found, please try again'
          });
          console.log("User Not Found");
          return;
    }

  });
  console.log("GOT REQUEST: " + req.body.username);
});

app.post('/logout', (req, res) => {
    console.log("SESSION ID: " + req.session.id);
    if (req.session.userID){
      console.log(req.session.userID + " logged out.");
      req.session.destroy()
      res.json({
        success: true
      });
      return true;

    }
    else{
      console.log("Already logged out. " + JSON.stringify(req.session) + " ID: " + req.session.userID);
      res.json({
        success: false
      });

      return false;
    }
});


app.post('/isLoggedIn', (req, res) => {
    console.log("SESSION ID: " + req.session.id);
    if (req.session.userID){
      let cols = [req.session.userID];
      db.get('SELECT * FROM users WHERE username = ?', cols, (err, data) => {
        if (data){
          res.json({
            success: true,
            username: data.username
          });
          console.log(data.username + " is logged in.");
          return true;
        }
        else{
          res.json({
            success:false
          });
        }
    });
  }
  else
  {
    res.json({
      success:false
    });
    console.log("NO USER ID!");
    return;
  }
});

app.listen(8080);
