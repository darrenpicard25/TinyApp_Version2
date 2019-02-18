//Require Modules and set up server
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  let randID = '';
  for (let i = 1; i <= 6; i++) {
    randID += characters[Math.floor(Math.random()*characters.length)];
  }
  return randID;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateData = {
    'urls' : urlDatabase,
    username: req.cookies.username
     };
  res.render('urls_index', templateData);
});
app.post('/urls', (req, res) => {
  let newURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls`);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  let deletingURL = req.params.shortURL;
  delete urlDatabase[deletingURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let newURL = req.body.newlongURL;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  let link = urlDatabase[req.params.shortURL];
  res.redirect(link);
});

app.get("/urls/new", (req, res) => {
  let templateData = {
  'urls' : urlDatabase,
  username: req.cookies.username
   };
  res.render("urls_new", templateData);
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.get('/urls/:shortURL', (req, res) => {
  let templateData = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateData);
});


//Set Server to listen to port 8080
app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});