var express = require('express');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./posts')
const passport = require('passport')
const localstrategy = require('passport-local')
const upload = require('./multer')
const dp = require('./profileup')

passport.use(new localstrategy(userModel.authenticate()))

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  res.redirect('/')
}

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) return next()
  res.redirect('/home')
}

/* GET home page. */
router.get('/', isNotLoggedIn, function (req, res, next) {
  res.render('index');
});

router.get('/post/:url', async function (req, res, next) {
  const postget = await postModel.findOne({image : req.params.url})
  const userdata =  await userModel.findOne({_id : postget.userid})
  res.render('post',{postdata : postget, postuser : userdata });
}); 

router.get('/home', isLoggedIn, async function (req, res, next) {
  const userdata = await userModel.findOne({username : req.session.passport.user})
  postModel.find({}).then(function (posts) {
    res.render('home', { dp : userdata.dp, post : posts });
    console.log(posts);
    });
});

router.get('/create', isLoggedIn, async function (req, res, next) {
  const userdata = await userModel.findOne({username : req.session.passport.user})
  res.render('create', { dp: userdata.dp });
});

router.get('/editprofile', isLoggedIn,async function (req, res, next) {
  const userdata = await userModel.findOne({username : req.session.passport.user})
  res.render('editprofile',  { dp: userdata.dp });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const userdata = await userModel.findOne({ username: req.session.passport.user }).populate('posts')
  console.log(userdata);
  res.render('profile', { fullname: userdata.fullname, username: userdata.username, dp : userdata.dp, posts : userdata.posts });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res, next) { });

router.post('/signup', async (req, res) => {
  const { email, username, dob } = req.body
  const CreatedUser = new userModel({ email, username, dob })
  userModel.register(CreatedUser, req.body.password)
    .then(() => {
      userModel.authenticate('local')(req, res, () => {
        res.redirect('/home')
      })
    })
})


router.post('/upload', isLoggedIn, upload.single('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(404).send('No Files Given')
  }

  const getuser = await userModel.findOne({ username: req.session.passport.user })
  const userpost = await postModel.create({
    image: req.file.filename,
    title: req.body.title,
    description: req.body.desc,
    link: req.body.link,
    tags: req.body.tags,
    userid: getuser._id
  })

  console.log(userpost._id);
  getuser.posts.push(userpost._id)
  await getuser.save()
  res.redirect('/profile')

})

router.post('/updateprofile',dp.single('dp'),async (req, res) => {
  const userfind = await userModel.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, email: req.body.email, dob: req.body.dob, fullname: req.body.fullname, dp :req.file.filename }, {
    new: true
  })

  res.redirect('/profile')

})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
