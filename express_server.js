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


//Set Server to listen to port 8080
app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});