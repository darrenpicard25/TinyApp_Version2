/*

Require All Modules to be used
----------------------------------------------------------
*/
const methodOverride = require('method-override');
const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const PORT = 8080;

/*

Set Server to use certain modules
------------------------------------------------------------
*/
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['code4Life#'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));

/*

All functions used in server
----------------------------------------------------------------------------------
*/

//Function generates a random 6 character string and returns it
function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  let randID = '';
  for (let i = 1; i <= 6; i++) {
    randID += characters[Math.floor(Math.random() * characters.length)];
  }
  return randID;
}

//Function checks to see if an email exists in the user database.
//Returns the string if found or an empty string if not found
function emailChecker(email) {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user].id;
    }
  }
  return '';
}

//Takes in a user ID and returns an object with same structure us urlsDatabase but it only contains the urls linked to that id
function urlsForUser (id) {
  const userURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}
/*

Both URL and User Databases

*/
const urlDatabase = {};   //Data base containing all the URLs. Short Long and ID of who created them
const usersDatabase = {};   //Database of each user registered

/*

All Unique Requests
----------------------------------------------------
*/
app.get('/u/:shortURL', (req, res) => {
  try {
    const link = urlDatabase[req.params.shortURL].longURL;
    res.redirect(link);
  }
  catch (error) {
    res.send('This Short URL no longer Exists\n');
  }
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
/*

All Main GET Requests
-----------------------------------------------------
*/
app.get('/', (req, res) => {
  if(req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const templateData = {
    'urls' : urlsForUser(req.session.user_id),
    username: usersDatabase[req.session.user_id]
     };
  res.render('urls_index', templateData);
});

app.get('/register' , (req, res) => {
  const templateData = {
    'urls' : urlDatabase,
    username: usersDatabase[req.session.user_id]
   };
  res.render('urls_register', templateData);
});

app.get('/login', (req, res) => {
  const templateData = {
    'urls' : urlDatabase,
    username: usersDatabase[req.session.user_id]
    };
  res.render('urls_login', templateData);
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id) {
    const templateData = {
    'urls' : urlDatabase,
    username: usersDatabase[req.session.user_id]
     };
    res.render("urls_new", templateData);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const currentUser = req.session.user_id;
  const urlCreator = urlDatabase[req.params.shortURL].userID;

  if (currentUser === urlCreator) {
    const templateData = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: usersDatabase[req.session.user_id]
    };
    res.render('urls_show', templateData);
  } else {
    res.send('This page does not belong to you\n');
  }
});
/*

All POST Requests
----------------------------------------------------------------
*/
app.post('/urls', (req, res) => {
  const newURL = req.body.longURL;
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: newURL, userID: userID};
  res.redirect(`/urls`);
});
/*

All PUT Requests
---------------------------------------------------------------------
*/
app.put('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = emailChecker(email);

  if (id && bcrypt.compareSync(password ,usersDatabase[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.put('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newId = generateRandomString();

  if (newEmail && newPassword && !emailChecker(newEmail)) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
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

app.put('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


app.put('/urls/:shortURL', (req, res) => {
  const currentUser = req.session.user_id;
  const urlCreator = urlDatabase[req.params.shortURL].userID;
  if (currentUser === urlCreator) {
    const newURL = req.body.newlongURL;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = newURL;
    res.redirect('/urls');
  } else {
      res.send('This page does not belong to you. So you cannot edit it\n');
  }
});
/*

All App Delete Requests
--------------------------------------------------------------------------------
*/
app.delete('/urls/:shortURL/delete', (req, res) => {
  const currentUser = req.session.user_id;
  const urlCreator = urlDatabase[req.params.shortURL].userID;
  if (currentUser === urlCreator) {
    const deletingURL = req.params.shortURL;
    delete urlDatabase[deletingURL];
    res.redirect('/urls');
  } else {
      res.send('This page does not belong to you. So you cannot delete it\n');
  }
});
/*

Let Server start listening for requests on the Port
----------------------------------------------------------
*/
app.listen( PORT, () => {
  console.log(`TinyApp Server listening on Port: ${PORT}`);
});