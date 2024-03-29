const mongoose = require("mongoose");

// FIXME: I really don't know... Should I use a "User" model? An "Account" model? Both?
// fixme: I'm saying "const UserModel = require("../models/account.model.js");" in another file :-( 'account' becomes 'user'

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const USER_TYPES = {
    // instead of writing "admin", write UserTypes.ADMIN, so there's no typos.
    ADMIN: "admin",
    MODERATOR: "moderator",
    USER: "user",
};

const LEAVE_THIS_FALSE = false;

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
        fullName: { type: String, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
        dateOfBirth: { type: Date, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
        // note: "select: false" means you have to clarify your query to the db, "get the field even tho i said 'false' for 'select'"

        // account security stuff -- should this be in a separate db from info displayed on their profile?
        passwordHash: {
            type: String,
            required: true,
            select: LEAVE_THIS_FALSE,
        }, // FALSE so it doesn't get sent to client accidentally
        accountCreatedAt: { type: Date, required: true },
        verificationCode: { type: String, required: true },
        joinDate: { type: Date, required: true },
        accountVerifiedAt: { type: Date, required: true },
        failedVerifications: { type: Number, required: true },
        activeAccount: { type: Boolean, required: true }, // "finished signup?"
        accountType: { type: String, required: true }, // user, moderator, admin,
        resetToken: {
            token: String,
            expires: Date,
        },
        passwordResetAt: { type: Date },
        verifiedAt: { type: Date },
        lastUpdatedInfo: { type: Date },
        acceptsTermsAndConditions: { type: Boolean, required: true },

        // account status
        suspended: { type: Boolean, required: true },
        accountType: { type: String, required: true }, // user, moderator, admin, verified
        // fixme: accountType is in here twice
        // personal info to display on the profile
        bio: { type: String, required: true },
        location: { type: String, required: false }, // fixme: location field exists, but also city, state, country. bad. fix!
        // birthday: { type: Date, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        age: { type: Number, required: true },
        familySize: { type: Number, required: true },
        familyValues: { type: Array, required: true },
        interests: { type: Array, required: true },
        hasPets: { type: Boolean, required: true },
        diet: { type: String, required: true },
        drinks: { type: Boolean, required: true },
        smokes: { type: Boolean, required: true },
        drugs: { type: Boolean, required: true }, // TODO: say something like, "if you do drugs, this isn't the site for you."
        hasPremium: { type: Boolean, required: true },

        likes: { type: Array, required: true }, // likes = swipes.
        recentlySeen: { type: Array, required: true },
        blockList: { type: Array, required: true },
    },
    {
        timestamps: true,
    }
);

/** only non-self explanatory params are explained
 * @param {String} firstName
 * @param {String} lastName
 * @returns {Object} new user object created
 */
userSchema.statics.createUser = async function (
    username,
    fullName,
    bio,
    location,
    city,
    state,
    country,
    age,
    familySize,
    familyValues,
    interests,
    hasPets,
    diet,
    drinks,
    smokes,
    drugs,
    hasPremium
) {
    const fakeEmail = "foo@bar.com";
    const dobFaked = new Date();
    const pwHashFake = "asdfdkasfjasd";
    const acctCreatedAtFaked = new Date();
    const stringFake = "asdfdsfjds";
    const integerFake = 0234234;
    const fakeBool = true;
    const FAKE_USER_TYPE = "user";
    const introArray = [];
    console.log("asfu9wfu89ewfa9f9asf9dsfad");
    // task 1: find out how the auth system creates a new user in the db. Task 2: make this createUser func align with auth sys.
    const user = await this.create({
        username: username,
        email: fakeEmail,
        fullName: fullName,
        dateOfBirth: dobFaked,
        passwordHash: pwHashFake,
        accountCreatedAt: acctCreatedAtFaked,
        verificationCode: stringFake,
        joinDate: dobFaked,
        accountVerifiedAt: dobFaked, // joindate, verifiedAt
        failedVerifications: integerFake, // fails
        activeAccount: fakeBool,
        accountType: FAKE_USER_TYPE,
        acceptsTermsAndConditions: fakeBool,
        suspended: fakeBool,
        accountType: FAKE_USER_TYPE,
        bio,
        location,
        city,
        state,
        country,
        age,
        familySize,
        familyValues,
        interests,
        hasPets,
        diet,
        drinks,
        smokes,
        drugs,
        hasPremium,
        introArray,
        introArray,
        introArray,
    });
    console.log("NOPE");
    return user;
};

/**
 * @param {String} id, user id
 * @return {Object} User profile object
 */
userSchema.statics.getUserById = async function (id) {
    try {
        const user = await this.findOne({ _id: id });
        if (!user) throw { error: "No user with this id found" };
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * @return {Array} List of all users
 */
userSchema.statics.getUsers = async function () {
    try {
        const users = await this.find();
        return users;
    } catch (error) {
        throw error;
    }
};

/**
 * @param {Array} ids, string of user ids
 * @return {Array of Objects} users list
 */
userSchema.statics.getUserByIds = async function (ids) {
    try {
        const users = await this.find({ _id: { $in: ids } });
        return users;
    } catch (error) {
        throw error;
    }
};

/**
 * @param {String} id - id of user
 * @return {Object} - details of action performed
 */
userSchema.statics.deleteByUserById = async function (id) {
    try {
        const result = await this.remove({ _id: id });
        return result;
    } catch (error) {
        throw error;
    }
};

// @@@@ @@@@ @@@@
// @@@@ @@@@ @@@@
// Profile Methods

userSchema.statics.getProfileById = async function (id) {
    try {
        const result = await this.findOne({ _id: id });
        return result;
    } catch (error) {
        throw error;
    }
};

userSchema.statics.createProfileData = async function () {
    try {
        // const result = await this.create({ _id: id }); // uhh... createById? when will this thing get used?
        // I'm gonna skip creating the CreateProfile section and backend because I'm not sure how the workflow will go...
        // wait no i'll just google someone else's workflow and use it lol
        return result;
    } catch (error) {
        throw error;
    }
};

userSchema.statics.updateProfile = async function (id, updates) {
    try {
        // // bio, location, familySize, familyValues, interests, hasPets, diet, drinks, smokes, hasPremium
        // TODO: how to handle udpate with one method, but such that the method can handle various diff fields being
        // populated, or not populated, or whatever? 8 fields, could be updates made to any one of em.
        const result = await this.findByIdAndUpdate(
            { _id: id },
            {
                bio: updates.bio,
                location: updates.location,
                familySize: updates.fSize,
                familyValues: updates.fValues,
                interests: updates.interests,
                hasPets: updates.hasPets,
                diet: updates.diet,
                drinks: updates.drinks,
                smokes: updates.smokes,
            }
        );
        return result;
    } catch (error) {
        throw error;
    }
};

// @@@@ @@@@ @@@@
// @@@@ @@@@ @@@@

// MATCHMAKER related stuff:
// getCandidatesForUser,
// add Likes,
// delete Like,
// add to Recently Seen,
// delete from Recently Seen,
// create Match,
// delete Match,
//

/**
 * @param {String} suitorId - id of user who owns the LikesList
 */
userSchema.statics.getCandidatesForUser = async function (suitorId) {
    try {
        const suitor = await this.findOne({ _id: { $in: suitorId } });
        const excludeByLikes = suitor.likes;
        const excludeByRecentlySeen = suitor.recentlySeen;
        const summedExclusions = excludeByLikes.concat(excludeByRecentlySeen);
        // find users who are not excluded!
        // TODO: exclude by location... or include only by location.
        const candidates = await this.find({
            _id: { $nin: summedExclusions },
        }).limit(5);
        return candidates;
    } catch (error) {
        throw error;
    }
};

/**
 * @param {String} suitorId - id of user who owns the LikesList
 * @param {String} candidateId - id of candidate, the one who is going in the list
 */
userSchema.statics.updateLikesListForUser = async function (
    suitorId,
    candidateId
) {
    // console.log("this will print");
    try {
        // fixme: this is supposed to grab the user the admin is targeting
        // console.log("logogoggogog", suitorId);
        const suitor = await this.findOne({ _id: { $in: suitorId } });
        // console.log("no suitor found?", suitor);
        suitor.likes.push(candidateId);
        // console.log("this aint running either", suitor);
        const result = await suitor.save();
        // console.log("result:", result);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

userSchema.statics.deleteLikeFromUserList = async function (
    suitorId,
    candidateId
) {
    try {
        const result = this.update(
            { _id: suitorId },
            { $pull: { likes: candidateId } }
        );
        return result;
    } catch (error) {
        throw error;
    }
};

userSchema.statics.addToRecentlySeenList = async function (
    suitorId,
    candidateId
) {
    try {
        const suitor = await this.findOne({ _id: suitorId });
        suitor.recentlySeen.push(candidateId);
        const result = suitor.save();
        return result;
    } catch (error) {
        throw error;
    }
};

userSchema.statics.createMatch = async function (userOneId, userTwoId) {
    try {
        const userOne = await this.findOne({ _id: userOneId });
        const userTwo = await this.findOne({ _id: userTwoId });
        userOne.matches.push(userTwoId);
        userTwo.matches.push(userOneId);
        const res1 = userOne.save();
        const res2 = userTwo.save();
        return res1 && res2; // this is supposed to return true if both operations go well...
    } catch (error) {
        throw error;
    }
};

// @@@@ @@@@ @@@@
// @@@@ @@@@ @@@@
// BLOCKS

userSchema.statics.blockUser = async function (userId, blockedId) {
    try {
        const result = await this.update(
            { _id: userId },
            {
                $push: {
                    blocks: { _id: blockedId },
                },
            }
        );
        // NOTE ABOUT YAGNI: you do NOT need to cleanse the blocked user's matches array of the blocking user's uid
        // because... if Blockey McBlockerson decides to unblock, they can go right back to being matched!
        return result;
    } catch (error) {
        throw error;
    }
};

userSchema.statics.unblockUser = async function (userId, blockedId) {
    try {
        const result = await this.update(
            { _id: userId },
            {
                $pull: {
                    blocks: { _id: blockedId },
                },
            }
        );
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    USER_TYPES: USER_TYPES,
    UserModel: mongoose.model("User", userSchema),
    // FIXME: I think this should be the statics from https://github.com/adeelibr/node-playground/blob/master/chapter-1-chat/server/models/User.js
};
