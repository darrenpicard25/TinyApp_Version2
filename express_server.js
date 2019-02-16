const express = require('express');

const app = express();
const PORT = 8080;

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});