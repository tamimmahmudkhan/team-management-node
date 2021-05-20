const express = require('express');
const app = express();
const server = require('http').Server(app)
var io = require('socket.io')(server)
const db = require('./db/db')
const employee = require('./models/employee')
const bodyParser = require('body-parser');
const session = require('express-session');
const { json } = require('express');
const sqlite = require('sqlite3').verbose();
const port = 3000

app.use(express.static(__dirname + '/views'))
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: "secret"
}))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

io.on('connection', () => {
  console.log("Chat up")
})

app.get('/', (req, res) => {
  console.log("Loading homepage")
  res.sendFile('/home/igneel/Documents/final-project/views/login.html')
})

app.post('/', function (req, res) {
  console.log("Email is : " + req.body.email)
  console.log("Password is " + req.body.password)
  var { email, password } = req.body

  let sql = `Select * from staff where email=? and password=?`

  var staff = db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.log(err.message);
    }
    if (row) {
      console.log("Storing to session.")
      req.session.loggedUser = {
        'fname': row.fname,
        'lname': row.lname,
        'dob': row.dob,
        'position': row.position,
        'email': row.email,
        'password': row.password
      }
      req.session.cookie.position = row.position
      res.redirect('/table.html')
    } else {
      res.redirect('/')
    }
  })
})

app.get('/register.html', (req, res) => {
  res.sendFile('/home/igneel/Documents/final-project/views/register.html')
})

app.post('/register.html', (req, res) => {
  var { fname, lname, dob, email, password } = req.body;

  db.run(`insert into staff(fname, lname, dob, email, password) Values(?,?,?,?,?)`, [fname, lname, dob, email, password], (err) => {
    if (err) {
      console.log(err.message)
      res.end("Error Occured")
    } else {
      console.log("Entry inserted!")
      res.redirect('/')
    }
  })
})

app.get('/table.html', (req, res) => {
  if (req.session.loggedUser) {
    res.render('/home/igneel/Documents/final-project/views/table.html')
  } else {
    res.redirect("/")
  }
})

app.get('/chat', (req, res) => {
  db.all("select * from messages", (err, rows) => {
    if (err) {
      console.log(err.message)
    } else {
      var msg = []
      rows.forEach((row) => {
        msg.push({
          name: row.name,
          message: row.message
        })
      })
      res.json(msg)
    }
  })
})

app.post('/chat', (req, res) => {
  console.log('posted')
  var { mssg } = req.body;
  if (mssg) {
    db.run("insert into messages(name, message) Values(?, ?)", [`${req.session.loggedUser.fname} ${req.session.loggedUser.lname}`, mssg], (err) => {
      if (err) {
        console.log(err.message)
      }
      io.emit('message', JSON.stringify({ name: `${req.session.loggedUser.fname} ${req.session.loggedUser.lname}`, message: mssg }));
      res.sendStatus(200);
    })
  } else {
    console.log(req.body)
  }
})

app.get('/current', (req, res) => {
  res.json(req.session.loggedUser)
})

app.post('/staff-edit', (req, res) => {
  console.log(req.body)
  var { name, dateofbirth, position, workdays, absentdays, email, team, project, id } = req.body;

  db.run('update staff set fname=?, lname=?, dob=?, position=?, email=?, workDays=?, absentDays=?, team=?, project=? where _id=?', 
  [name.split(" ")[0], name.split(" ")[1], dateofbirth, position, email, workdays, absentdays, team, project, id], (err)=>{
    if(err){
      console.log(err.message)
    } 
  io.emit('staff-refresh')
  res.sendStatus(200)
  })
})

app.post('/team-edit', (req, res) => {
  var { name, members, project, id } = req.body;

  db.run('update teams set name=?, members=?, project=? where _id=?', [name, members, project, id], (err)=>{
    if(err){
      console.log(err.message)
    }
  io.emit('team-refresh')
  res.sendStatus(200)
  })
})

app.post('/project-edit', (req, res) => {
  var { name, status, team, id } = req.body;

  db.run('update projects set name=?, status=?, team=? where _id=?', [name, status, team, id], (err)=>{
    if(err){
      console.log(err.message)
    }
  io.emit('project-refresh')
  res.sendStatus(200)
  })
})
app.get('/data-staff', (req, res) => {
  db.all(`Select * from staff`, [], (err, rows) => {
    var staff = [];

    rows.forEach((row) => {
      var person = {
        '_id': row._id,
        'fname': row.fname,
        'lname': row.lname,
        'dob': row.dob,
        'position': row.position,
        'workDays': row.workDays,
        'absentDays': row.absentDays,
        'email': row.email,
        'password': row.password,
        'team': row.team,
        'project': row.project
      }
      staff.push(person)
    })

    res.json(staff)
  })
})

app.get('/data-team', (req, res) => {
  db.all(`Select * from teams`, [], (err, rows) => {
    var teams = [];

    rows.forEach((row) => {
      var team = {
        '_id': row._id,
        'name': row.name,
        'members': row.members,
        'project': row.project,
        'portNo': row.port_no
      }
      teams.push(team)
    })

    res.json(teams)
  })
})

app.get('/data-project', (req, res) => {
  db.all(`Select * from projects`, [], (err, rows) => {
    var projects = [];

    rows.forEach((row) => {
      var project = {
        '_id':row._id,
        'name': row.name,
        'status': row.status,
        'team': row.team
      }
      projects.push(project)
    })

    res.json(projects)
  })
})

process.on('exit', function () {
  db.close();
})