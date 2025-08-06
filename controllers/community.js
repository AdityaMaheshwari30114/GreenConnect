const Community = require("../models/community");

// Create Community
async function handleCreateCommunity(req, res) {
    const { name } = req.body;

    // Check if community with the same name exists
    const existing = await Community.findOne({ name });
    if (existing) {
        return res.send("Community name already exists. Try a different name.");
    }

    // Create new community
    const community = await Community.create({
        name,
        createdBy: req.user._id,
        members: [req.user._id],
    });

    return res.redirect(`/community/${community._id}/chat`);
}

// Join Community
async function handleJoinCommunity(req, res) {
    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community) {
        return res.status(404).send("Community not found");
    }

    // Add user if not already a member
    if (!community.members.includes(req.user._id)) {
        community.members.push(req.user._id);
        await community.save();
    }

    return res.redirect(`/community/${id}/chat`);
}

// List All Communities (for join page)
async function handleListCommunities(req, res) {
    const communities = await Community.find({});
    return res.render("community/join-community", { user: req.user, communities });
}

// List My Communities (optional for dashboard)
async function handleMyCommunities(req, res) {
    const myCommunities = await Community.find({
        members: req.user._id,
    });
    return res.render("community/my-communities", { user: req.user, myCommunities });
}

module.exports = {
    handleCreateCommunity,
    handleJoinCommunity,
    handleListCommunities,
    handleMyCommunities
};
