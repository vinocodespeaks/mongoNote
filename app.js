const express = require("express")
var bodyParser = require('body-parser')
// for additional methods like put delete in the <form> tag to edit delete
var methodOverride = require('method-override')
const mongoose = require("mongoose")
const exphbs = require('express-handlebars')
const session = require("express-session")
const flash = require("connect-flash")
const port =3000
const app=express();
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
//set engine
app.engine('handlebars',exphbs({
    defaultLayout : 'main'
}))
app.set('view engine','handlebars')
// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('_method'));

//express session 
app.use(session({
  secret: 'vinod',
  resave: true,
  saveUninitialized: true,
}))

//connect-flash middleware
app.use(flash())
// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
//middleware 
/*app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
  })*/

//database

mongoose.connect('mongodb://localhost/nodeNoteApp',{
//dont put mongo client if you are using mongoose 5.x++ version    
//useMongoClient:true 

}).then(()=>{
    console.log("database is connected to your app")
}).catch((error)=>{
console.log("oouch ! somthing wrong with your database error is "+error)
})

//after creating schema import all model
require('./models/noteModel');
const noteSchema = mongoose.model('notes');
//root page
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
      title: title
    });
  });

//about page  
  app.get('/about', (req, res) => {
    res.render('about');
  });
//Add note
  app.get('/note/add', (req, res) => {
    const title = 'Welcome';
    res.render('note/addnote', {
      title: title
    });
  });
  
  //Edit note
  app.get('/note/edit/:id', (req, res) => {
    noteSchema.findOne({
      _id: req.params.id
    })
    .then(note => {
      res.render('note/editnote', {
        note:note
      });
    });
  });
  // Edit Form process

  app.put('/notes/:id',urlencodedParser, (req, res) => {
   
    noteSchema.findOne({
      _id: req.params.id
    })
    .then(note => {
      // new values
      console.log("in the editing process")
      note.title = req.body.title;
      note.details = req.body.details;
  
    let editedNote = new noteSchema(note)
      editedNote.save()
        .then(note => {
          req.flash('success_msg', 'note updated');
          res.redirect('/notes');
        })
    }).catch(e => console.log("error editing process"+e));
  });
  //Delete note
  app.delete('/notes/:id', (req, res) => {
    noteSchema.remove({_id: req.params.id})
      .then(() => {
        req.flash('success_msg', 'note removed');
        res.redirect('/notes');
        
      });
  });

  

  // Idea Index Page
app.get('/notes', (req, res) => {
  noteSchema.find({})
    .sort({date:'desc'})
    .then((notes)=> {
      res.render('note/allnotes', {
       notes
      });
    });
});
  app.post('/notes',  urlencodedParser,(req, res) => {
    let errors = [];
  
    if(!req.body.title){  
      errors.push({text:'Please add a title'});
    }
    if(!req.body.details){
      errors.push({text:'Please add some details'});
    }
  
    if(errors.length > 0){
      res.render('note/addnote', {
        errors: errors,
        title: req.body.title,
        details: req.body.details
      });
    } else {
      var newUser={
        title:req.body.title,
        details:req.body.details
      }
     let newNote=new noteSchema(newUser)
    
        newNote.save().then((notes)=>{
          req.flash('success_msg', "note added");
          res.redirect('/notes')
        })
    }
  });
//Broadcasting in the browser
app.listen(port,()=>{
    console.log(`app is running on port ${port} just check it out`)
})



