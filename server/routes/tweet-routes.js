const express = require('express');
const { Tweet } = require('../models/tweet');
const router = express.Router();
const handleAsyncErr = require('../utils/catchAsync');
const isLoggedin = require('../utils/isLoggedin');
const Comment = require('../models/comment');

// GET all tweets
router.get("/", async (req, res, next) => {
    // Fetch tweets and sort by createdAt field in descending order (newest first)
    const tweets = await Tweet.find().sort({ createdAt: -1 }).populate('author');
    res.json(tweets);
});

// POST a new tweet
router.post("/", isLoggedin, handleAsyncErr(async (req, res, next) => {
    const newTweet = await Tweet.create({
        ...req.body,
        author: req.user._id,
        createdAt: new Date() // Assign the creation date to the createdAt field
    });
    await newTweet.save(); // Save the changes to the database
    res.json({ newTweet });

}));

// GET a specific tweet by ID
router.get("/:id", handleAsyncErr(async (req, res, next) => {
    const foundTweet = await Tweet.findById(req.params.id).populate('author');
    res.json(foundTweet);
}));

// Delete a specific tweet by ID
router.delete("/:id", isLoggedin, handleAsyncErr(async (req, res, next) => {
    const tweet = await Tweet.findById(req.params.id).populate('author');
    if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
    }
    // Check if the authenticated user's ID matches the tweetauthorid of the tweet
    if (!req.user._id.equals(tweet.author._id)) {
        return res.status(403).json({ message: "Unauthorized: You don't have permission to delete this tweet" });
    }
    await Tweet.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Tweet deleted successfully" });
}));


// Delete a specific comment by ID in campground and comment model
router.delete("/:id/comments/:commentid", isLoggedin, handleAsyncErr(async (req, res, next) => {
    const { id, commentid } = req.params;
    const foundComment = await Comment.findById(commentid).populate('author');
    if (!foundComment) {
        return res.status(404).json({ message: "Comment not found" });
    }
    // Check if the authenticated user's ID matches the comment author id of the tweet
    if (!req.user._id.equals(foundComment.author._id)) {
        return res.status(403).json({ message: "Unauthorized: You don't have permission to delete this comment" });
    }
    await Tweet.findByIdAndUpdate(id, { $pull: { comments: commentid } });
    await Comment.findByIdAndDelete(commentid);
    return res.status(200).json({ message: "Comment deleted successfully" });
}));

//error handling middleware
router.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(err);
    console.log(err)
})
module.exports = router;













