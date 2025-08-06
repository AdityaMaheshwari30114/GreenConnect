const express = require("express");
const http = require("http");
const path = require('path');
const { Server } = require("socket.io");
const { connectToMongoDB } = require('./utils/connect');
const userRoutes = require("./routes/user");
const setupSocket = require("./socket/socket");
const cookieParser = require("cookie-parser");
const { restrictToLoggedInUsersOnly, checkAuth } = require('./middlewares/auth');

const dashboardRoutes = require("./routes/dashboard");
const communityRoutes = require("./routes/community");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Mongo
connectToMongoDB("mongodb://localhost:27017/chatApp");

// Middleware
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use("/dashboard", dashboardRoutes);
app.use("/community", communityRoutes);

app.get('/', restrictToLoggedInUsersOnly, (req, res) => {
  return res.sendFile(path.join(__dirname, "public/index.html"));
});
app.use(express.static(path.resolve("./public")));

// Routes
app.use('/user', userRoutes);
// app.use("/", checkAuth);

app.get('/login', checkAuth, (req, res) => {
    if (req.user) return res.redirect('/');
    res.sendFile(path.join(__dirname, "views/auth/login.html"));
});

app.get('/signup', checkAuth, (req, res) => {
    if (req.user) return res.redirect('/');
    res.sendFile(path.join(__dirname, "views/auth/signup.html"));
});

//  Protect main chat page
// app.get('/', restrictToLoggedInUsersOnly, (req, res) => {
//   return res.sendFile(path.join(__dirname, "public/index.html"));
// });

app.get('/logout', (req, res) => {
  res.clearCookie('uid');
  return res.redirect('/login');
});


// Socket
setupSocket(io);

// Server
server.listen(9000, () => console.log(`Server Started at PORT 9000`));
