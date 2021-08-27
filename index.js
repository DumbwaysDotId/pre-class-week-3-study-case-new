const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const session = require('express-session');

const dbConnetion = require('./connection/db');
const uploadFile = require('./middlewares/uploadFile');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

const server = http.createServer(app);
const port = 3000;
const pathFile = 'http://localhost:3000/uploads/';
// var isLogin = false;

// Setup flash message middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// URL
app.get('/', function (req, res) {
  const query = `SELECT * FROM tb_article ORDER BY id DESC;`;

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, (err, results) => {
      if (err) throw err;

      var articles = [];

      for (var result of results) {
        articles.push({
          ...result,
          image: pathFile + result.image,
        });
      }

      if (articles.length == 0) {
        articles = false;
      }

      console.log(articles);

      res.render('index', {
        title: 'Articles',
        isLogin: req.session.isLogin,
        articles,
      });
    });
  });
});

app.get('/article/:id', function (req, res) {
  var { id } = req.params;

  const query = `SELECT * FROM tb_article WHERE id = ${id}`;

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      const article = {
        ...results[0],
        image: pathFile + results[0].image,
      };

      var isContentOwner = false;

      if (req.session.isLogin) {
        if (req.session.user.id == article.user_id) {
          isContentOwner = true;
        }
      }

      res.render('article', {
        title: 'Articles',
        isLogin: req.session.isLogin,
        article,
        isContentOwner,
      });
    });
  });
});

app.get('/article-add', function (req, res) {
  res.render('addArticle', {
    title: 'Add Articles',
    isLogin: req.session.isLogin,
  });
});

app.get('/article-delete/:id', function (req, res) {
  const { id } = req.params;

  const query = `DELETE FROM tb_article WHERE id = ${id};`;

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      // if (err) throw err;

      if (err) {
        console.log(id);
        req.session.message = {
          type: 'danger',
          message: err.sqlMessage,
        };
        res.redirect('/');
      } else {
        req.session.message = {
          type: 'success',
          message: `Article successfully deleted! ID = ${id}`,
        };

        res.redirect('/');
      }
    });
  });
});

app.post('/article-add', uploadFile('image'), function (req, res) {
  const { title, content } = req.body;
  const image = req.file.filename;
  const userId = req.session.user.id;

  if (title == '' || content == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please insert all field!',
    };
    return res.redirect('/article-add');
  }

  const query = `INSERT INTO tb_article (image,title,content,user_id) 
                  VALUES ('${image}','${title}','${content}','${userId}');`;

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: 'success',
        message: 'Add article has successfully!',
      };

      res.redirect(`/article/${results.insertId}`);
    });
  });
});

app.get('/login', function (req, res) {
  res.render('login', {
    title: 'Login',
    auth: true,
  });
});

app.post('/login', function (req, res) {
  const { email, password } = req.body;
  const query = `SELECT id, email, MD5(password) as password, name, photo FROM tb_user WHERE email = '${email}' AND password = '${password}';`;

  if (email == '' || password == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please insert email or password!',
    };
    return res.redirect('/login');
  }

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      if (results.length == 0) {
        req.session.message = {
          type: 'danger',
          message: 'Email and password dont match!',
        };
        return res.redirect('/login');
      } else {
        req.session.message = {
          type: 'success',
          message: 'Login has successfully!',
        };
        req.session.isLogin = true;
        req.session.user = {
          id: results[0].id,
          email: results[0].email,
          name: results[0].name,
          photo: results[0].photo,
        };
        return res.redirect('/');
      }
    });
  });
});

app.get('/register', function (req, res) {
  res.render('register', {
    title: 'Register',
    auth: true,
  });
});

app.post('/register', function (req, res) {
  const { email, name, password } = req.body;
  const query = `INSERT INTO tb_user (email,password,name) VALUES ('${email}','${password}','${name}');`;

  if (email == '' || name == '' || password == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please insert all field!',
    };
    return res.redirect('/register');
  }

  dbConnetion.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: 'success',
        message: 'Register has successfully!',
      };

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

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
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
