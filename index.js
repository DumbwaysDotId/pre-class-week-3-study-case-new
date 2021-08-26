const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const flash = require('express-flash');
const session = require('express-session');

const dbConnetion = require('./connection/db');

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    cookie: {
      maxAge: 60000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: 'secretValue',
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

const server = http.createServer(app);
const port = 3000;

var isLogin = false;

// URL
app.get('/', function (req, res) {
  res.render('index', { title: 'Articles', isLogin });
});

app.get('/article/:id', function (req, res) {
  var { id } = req.params;

  res.render('article', { title: 'Articles', isLogin, id });
});

app.get('/article-add', function (req, res) {
  res.render('addArticle', { title: 'Add Articles', isLogin });
});

app.get('/login', function (req, res) {
  res.render('login', { title: 'Login', auth: true });
});

app.get('/register', function (req, res) {
  res.render('register', { title: 'Register', auth: true });
});

app.post('/register', function (req, res) {
  const { email, name, password } = req.body;
  const query = `INSERT INTO tb_user (email,password,name) VALUES ('${email}','${name}','${password}');`;
  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, (err, results) => {
      if (err) throw err;
      req.flash('success', 'Register has successfully!');
      res.redirect('/register');
    });
  });
});

app.get('/users', (req, res) => {
  const query = `SELECT * FROM tb_user`;

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, (err, results) => {
      if (err) throw err;
      res.send(results);
    });
  });
});

hbs.handlebars.registerHelper('isAuth', function (value) {
  if (value == true) {
    return false;
  } else {
    return true;
  }
});

server.listen(port);
console.debug('Server listening on port ' + port);
