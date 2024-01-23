var express = require('express');
var router = express.Router();
const userModel= require('./users')

const upload= require('./multer')

const passport= require('passport')
const localStrategy= require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {error:req.flash('error')});
});
router.get('/register', function(req, res) {
  res.render('signup');
});

router.get('/profile', isLoggedIn, async function(req, res) {
  const user= await userModel.find()
    res.render('profile',{user:user});
});

router.get('/addStudent', function(req, res) {
  res.render('addStudent');
});

router.get('/studentportal', function(req, res) {
  res.render('studentportal');
});

router.get('/markAttendence', isLoggedIn, async function(req, res) {
  let username= req.session.passport.user;
  let student= await userModel.findOne({username: username})
  let date=Date.now()
 
  const update= await userModel.findByIdAndUpdate(
    student._id,
    { $push: { attendence: date } },
    { new: true } // To return the updated document
  );
  if (!update) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.render('studentportal',{user: student})
});

router.get('/edit/:userid', isLoggedIn, async function(req, res) {
  console.log(req.params.userid)
  const user= await userModel.findOne({_id: req.params.userid})
  res.render('edit', {user: user})
})

router.post('/editSubmit/:userid', isLoggedIn, async function(req, res) {
  try {
    const user = await userModel.findById(req.params.userid);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const { firstname, lastname, username, email, course, password, number } = req.body;

    // Update the user's data
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.userid,
      { firstname, lastname, username, email, course, password, number },
      { new: true }
    );
    console.log(updatedUser)

    if (!updatedUser) {
      return res.status(404).send('User not found');
    } else {
      console.log('done editing');
    }

    res.render('edit', {user: updatedUser});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.post('/register', function (req,res ){
  console.log(req.body)
  const {email, username}= req.body;

  const user= new userModel({username, email});
  userModel.register(user,req.body.password)
  .then(function(){
  passport.authenticate("local")(req , res, function(){
    res.redirect('/profile')
    console.log('authenticated')
  })
})
  
})

router.post('/login', passport.authenticate('local',{
  failureRedirect: '/',
  failureFlash: true
}), async function(req, res) {
  // After successful authentication, check the user's role and redirect accordingly
  if (req.user.role === 'student') {
    let user=req.user;
    res.render('studentportal' , {user :user});
  }
   else if (req.user.role === 'admin') {
    const user= await userModel.find()
    user.forEach((user)=> {
      if(user.role==='student'){
        console.log(user)
      }
     
    })
    res.render('profile',{user:user});
  }
})

router.get('/logout', function (req, res) {
  req.logout(function(err) {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

function isLoggedIn(req , res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}


router.post('/addStudent', isLoggedIn , upload.single('file'), async function (req,res ){
  const {firstname,lastname,username,course, email, password,number}= req.body;
  const file=req.file.filename;
  
  const newStudent = new userModel({firstname,lastname,username, course, email, password,number, file ,role:'student'});

  userModel.register(newStudent ,req.body.password)
  .then(function(){
  passport.authenticate("local")(req , res, function(){
    res.redirect('/addStudent')
  })
})

})

// router.get('/students', async function(req,res){
 
  
//   res.render('profile', {user: user})
// } )

module.exports = router;
