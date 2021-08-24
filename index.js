const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');

app.use(express.json());
app.use(express.static('express'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

var isLogin = true;

// default URL for website
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

const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);

hbs.handlebars.registerHelper('isAuth', function (value) {
  if (value == true) {
    return false;
  } else {
    return true;
  }
});
