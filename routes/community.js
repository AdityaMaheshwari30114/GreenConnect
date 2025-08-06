const express = require("express");
const Community = require("../models/community");

const router = express.Router();
const {
    handleCreateCommunity,
    handleJoinCommunity,
    handleListCommunities,
    handleMyCommunities,
} = require("../controllers/community");

const { restrictToLoggedInUsersOnly } = require("../middlewares/auth");

// Show form to create a new community (optional view)
router.get("/create", restrictToLoggedInUsersOnly, (req, res) => {
    res.render("community/create-community", { user: req.user });
});

// Handle community creation
router.post("/create", restrictToLoggedInUsersOnly, handleCreateCommunity);

// List all communities (join page)
router.get("/", restrictToLoggedInUsersOnly, handleListCommunities);

// Join a specific community
router.get("/:id/join", restrictToLoggedInUsersOnly, handleJoinCommunity);

// (Optional) List only the communities user has joined
router.get("/mine", restrictToLoggedInUsersOnly, handleMyCommunities);

router.get("/:id/chat", restrictToLoggedInUsersOnly, async (req, res) => {
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
        return res.status(404).send("Community not found");
    }

    return res.render("community/community-chat", {
        user: req.user,
        community
    });
});


module.exports = router;
