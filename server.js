const express = require('express');
const mongoose = require('mongoose');
const Article = require('./models/blog')
const path = require('path');
const bodyparser = require("body-parser");
const articleRouter = require('./routes/articles')
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require('method-override')

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/topclient', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/dashboard', async (req, res) => {
    if(req.session.user){
        const articles = await Article.find().sort({ createdAt: 'dsec' })
        res.render('articles/dashboard', { articles: articles, user: req.session.user })
    }else{
        res.send("Unauthorize User")
    }
})

app.use(bodyparser.json());


// load static assets
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(session({
    secret: uuidv4(), //  '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    resave: false,
    saveUninitialized: true
}));

app.use('/articles', articleRouter)

// home route
app.get('/', async(req, res) => {
    const articles = await Article.find().lean().sort({createdAt:'desc'});
    res.render('articles/index', {  articles });
  });
  app.get('/login', async (req, res) => {
    const articles = await Article.find()
    res.render('articles/base', { articles: articles })
  })

  

app.listen(3000, ()=>{ console.log("Lostening to the server on http://localhost:3000")});