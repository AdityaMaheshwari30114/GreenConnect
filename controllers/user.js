const {v4: uuidv4} = require('uuid');

const User = require("../models/user");
const bcrypt = require("bcrypt");
const {setUser, getUser} = require("../service/auth");

async function handleUserSignup(req,res){
    const {name,email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    await User.create({
        name,
        email,
        password: hashedPassword,
    })
    return res.redirect("/");
};

async function handleUserLogin(req,res){
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.redirect("login");
        // return res.render('login',{
        //     error : "Invalid Username Or Password"
        // });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.redirect("login");
        
    }

     const sessionId = uuidv4();      // session
    setUser(sessionId, user);
    res.cookie("uid", sessionId);
    // return res.redirect("/");
    return res.redirect("/dashboard");
};

module.exports = {
    handleUserSignup,
    handleUserLogin,
}