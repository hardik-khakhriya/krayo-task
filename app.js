
require('dotenv').config()
const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('passport')
const path = require("path");
const multer = require("multer");
const fs = require("fs").promises

const app = express()

require('./passport-setup')

app.set("view engine", "ejs")

app.use(passport.initialize())

app.use(cookieSession({
    name: 'tuto-session',
    keys:['key1', 'key2']
}))

app.use(passport.session())

app.get('/',(req,res) => {
    res.render("pages/index")
})

app.get('/success',(req,res) => {
    console.log(req.user['provider'])
    res.render("pages/profile",{name:req.user.displayName,pic:req.user.photos[0].value,email:req.user.emails[0].value})
})

app.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] } ));

app.get('/google/callback', passport.authenticate('google', {failureRedirect:'/failed'}),
function(req,res)  {
    res.redirect('/success')
});

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/'); 
})

//new script

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${new Date().toISOString()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false}));

app.get("/", (req, res) => {
    return res.render("homepage");
});

app.get("/get-files", async (req, res) => {

    const filesList = await fs.readdir('uploads/', {  withFileTypes: true })
    const newFilesList = []
    for(let i=0;i<filesList.length;i++) {
        newFilesList.push(filesList[i].name)
    }

    return res.json(newFilesList);
});

app.get("/download/:fileName", (req, res) => {
    return res.download(`./uploads/${req.params.fileName}`);
});

app.post("/upload", upload.single("profileImage"), (req, res) => {
    console.log(req.body);
    console.log(req.file);

    return res.redirect("/success");
});

app.listen(5000,() => {
    console.log("App is running on port 5000")
})