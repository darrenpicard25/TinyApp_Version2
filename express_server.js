//Require Modules and set up server
const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['code4Life#'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  let randID = '';
  for (let i = 1; i <= 6; i++) {
    randID += characters[Math.floor(Math.random()*characters.length)];
  }
  return randID;
}

function emailChecker(email) {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user].id;
    }
  }
  return '';
}

function urlsForUser (id) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

const urlDatabase = {};

const usersDatabase = {};


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateData = {
    'urls' : urlsForUser(req.session.user_id),
    username: usersDatabase[req.session.user_id]
     };
  res.render('urls_index', templateData);
});
app.post('/urls', (req, res) => {
  let newURL = req.body.longURL;
  let userID = req.session.user_id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: newURL, userID: userID};
  res.redirect(`/urls`);


});
app.post('/urls/:shortURL/delete', (req, res) => {
  let currentUser = req.session.user_id;
  let urlCreator = urlDatabase[req.params.shortURL].userID;
  if (currentUser === urlCreator) {
    let deletingURL = req.params.shortURL;
    delete urlDatabase[deletingURL];
    res.redirect('/urls');
  } else {
      res.send('This page does not belong to you. So you cannot delete it\n');
  }
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = emailChecker(email);

  if (id && bcrypt.compareSync(password ,usersDatabase[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post('/urls/:shortURL', (req, res) => {
  let currentUser = req.session.user_id;
  let urlCreator = urlDatabase[req.params.shortURL].userID;
  if (currentUser === urlCreator) {
    let newURL = req.body.newlongURL;
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = newURL;
    res.redirect('/urls');
  } else {
      res.send('This page does not belong to you. So you cannot edit it\n');
  }
});

app.get('/register' , (req, res) => {
  let templateData = {
    'urls' : urlDatabase,
    username: usersDatabase[req.session.user_id]
   };
  res.render('urls_register', templateData);
});

app.post('/register', (req, res) => {
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  let newId = generateRandomString();
  if (newEmail && newPassword && !emailChecker(newEmail)) {
    let hashedPassword = bcrypt.hashSync(newPassword, 10);
    usersDatabase[newId] = {
    id: newId,
    email: newEmail,
    password: hashedPassword
  };
    req.session.user_id = newId;
    res.redirect('/urls');
  } else {
  res.sendStatus(400);
  }
});

app.get('/login', (req, res) => {
  let templateData = {
    'urls' : urlDatabase,
    username: usersDatabase[req.session.user_id]
    };
  res.render('urls_login', templateData);
});

app.get('/u/:shortURL', (req, res) => {
  let link = urlDatabase[req.params.shortURL].longURL;
  res.redirect(link);
});

app.get("/urls/new", (req, res) => {
  let templateData = {
  'urls' : urlDatabase,
  username: usersDatabase[req.session.user_id]
   };
  res.render("urls_new", templateData);
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


app.get('/urls/:shortURL', (req, res) => {
  let currentUser = req.session.user_id;
  let urlCreator = urlDatabase[req.params.shortURL].userID;
  if (currentUser === urlCreator) {
    let templateData = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: usersDatabase[req.session.user_id]
    };
    res.render('urls_show', templateData);
  } else {
    res.send('This page does not belong to you\n');
  }
});


//Set Server to listen to port 8080
app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});