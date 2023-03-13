// import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js'
require('dotenv').config();
// import { nanoid } from 'nanoid';
// const {nanoid} = require("nanoid");
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const validUrl = require('valid-url');
const mongoose = require("mongoose");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

// mongoose.connect('mongodb://127.0.0.1:27017/userDB', {useNewUrlParser: true});
mongoose.connect(process.env.MONGODB_URI);
const { Schema } = mongoose;

const urlSchema = new Schema({
    originalUrl: String,
    shortUrl: String
  });

  
const Url = mongoose.model("Url", urlSchema);

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  if (validUrl.isUri(originalUrl)){
    const shortUrl = uuidv4();
    const newUrl = new Url({
      originalUrl: originalUrl,
      shortUrl: shortUrl
    });
      
    newUrl.save().then(()=>{
      res.json({ 
        original_url: originalUrl,
        short_url: shortUrl});
    }).catch((err)=>{
      console.log(err);
    });
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get("/api/shorturl/:shorturl", function(req, res) {
  const requestedUrl = req.params.shorturl;
  Url.findOne({"shortUrl": requestedUrl}).then((foundUrl) =>{
    if (foundUrl){
      res.redirect(foundUrl.originalUrl);
    }
  }).catch((err) => {
    console.log(err);
  });
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
