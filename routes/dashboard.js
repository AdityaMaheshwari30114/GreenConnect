const express = require("express");
const path = require("path");
const router = express.Router();

const {restrictToLoggedInUsersOnly} = require("../middlewares/auth");

router.get("/", restrictToLoggedInUsersOnly,(req,res)=>{
    return res.sendFile(path.join(__dirname,"../views/dashboard/dashboard.html"));
});

module.exports = router;
