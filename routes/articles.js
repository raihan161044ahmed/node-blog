const express = require("express");
const router = express.Router();
const path = require('path');
const Article = require('../models/blog')
const multer = require('multer');



const  credential = {
    email : "admin@gmail.com",
    password : "123"
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Check File Type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// login user
router.post('/login', (req, res)=>{
    if(req.body.email == credential.email && req.body.password == credential.password){
        req.session.user = req.body.email;
        res.redirect('/articles/dashboard');
        //res.end("Login Successful...!");
    }else{
        res.end("Invalid Username")
    }
});

// route for dashboard
router.get('/dashboard', async(req, res) => {
    if(req.session.user){
      const articles = await Article.find().lean().sort({createdAt:'desc'});
        res.render('articles/dashboard', {user : req.session.user, articles})
    }else{
        res.render('articles/base')
    }
});
//create
router.get('/create',(req, res) => {
    if(req.session.user){
        res.render('articles/create', {user : req.session.user, article: new Article() })
    }else{
      res.render('articles/base')
    }
});
//edit
router.get('/edit/:id', async (req, res) => {
  if(req.session.user){
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { user : req.session.user,article: article })}
    else{
      res.render('articles/base')
    }
  });

 
  //save data
  router.post('/',upload.single('image'), async (req, res, next) => {
    req.article = new Article()
    next()
  }, saveArticleAndRedirect('show'));
  //Update
  router.put('/:id',upload.single('image'),async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
  }, saveArticleAndRedirect('edit'));
  //Delete
  router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('dashboard')
  });
  
  function saveArticleAndRedirect(path) {
    return async (req, res) => {
      let article = req.article
      article.title = req.body.title
      article.description = req.body.description
      if (req.file) {
        article.image = '/uploads/' + req.file.filename;
      }
      try {
        article = await article.save()
        res.redirect(`/articles/${article.slug}`)
      } catch (e) {
        res.render(`articles/${path}`, { article: article })
      }
    }
  };
   // route for logout
router.get('/logout', (req ,res)=>{
  req.session.destroy(function(err){
      if(err){
          console.log(err);
          res.send("Error")
      }else{
          res.render('articles/base', { title: "Express", logout : "logout Successfully...!"})
      }
  })
});
 //slug
 router.get('/:slug', async (req, res,next) => {
   if(req.session.user){
     const article = await Article.findOne({ slug: req.params.slug })
     if (article == null) res.redirect('/articles/dashboard')
     res.render('articles/show', { article: article })}
     else{    
       router.get('/:slug', async (req, res) => {
        const article = await Article.findOne({ slug: req.params.slug })
        if (article == null) res.redirect('/articles/dashboard')
        res.render('articles/user', { article: article })
        
      });
  }
  next()
});

module.exports = router;