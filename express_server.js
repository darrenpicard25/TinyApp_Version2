//Require Modules and set up server
const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateData = { 'urls' : urlDatabase };
  res.render('urls_index', templateData);
});
app.post('/urls', (req, res) => {
  let newURL = req.body.longURL;
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get('/urls/:shortURL', (req, res) => {
  let templateData = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateData);
});


//Set Server to listen to port 8080
app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});