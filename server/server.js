const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const tweetRoutes = require('./routes/tweet-routes');
const userRoutes = require('./routes/users');
const getUserRoutes = require('./routes/getUser');
const commentRoutes = require('./routes/comment');
const passport = require('./passport-auth/passport');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/twitter')
  .then(() => console.log("API twitter database connected"))
  .catch(err => console.log("Connection error:", err));

//express and app config
const app = express();
//To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }));
// To parse incoming JSON in POST request body:
app.use(express.json());

//Cors security check Ups
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

// Use Passport middleware
app.use(passport.initialize());


// Routes for user-related operations
app.use('/api/user', getUserRoutes); // Mount user-related routes under /api/user
// Use routes for both tweets and user 
app.use('/api/tweets', tweetRoutes, userRoutes);
//route for comments
app.use('/api/comments', commentRoutes);

//Listen for port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TWITTER API SERVER RUNNING on port ${PORT}`);
});
