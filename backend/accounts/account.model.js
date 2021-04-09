const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const LEAVE_THIS_FALSE = false;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
    fullName: { type: String, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
    dateOfBirth: { type: Date, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally

    // account security stuff -- should this be in a separate db from info displayed on their profile?
    passwordHash: { type: String, required: true, select: LEAVE_THIS_FALSE }, // FALSE so it doesn't get sent to client accidentally
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

    // personal info to display on the profile
    bio: { type: String, required: true },
    location: { type: String, required: false },
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
    blockList: { type: Array, required: true },
});

module.exports = {
    userModel: mongoose.model("User", userSchema),
    onGetAllUsers: async (req, res) => {
        try {
            const users = await UserModel.getUsers();
            return res.status(200).json({ success: true, users });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    },
    onGetUserById: async (req, res) => {
        try {
            const user = await UserModel.getUserById(req.params.id);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    },
    onCreateUser: async (req, res) => {
        try {
            const validation = makeValidation((types) => ({
                payload: req.body,
                checks: {
                    firstName: { type: types.string },
                    lastName: { type: types.string },
                    type: { type: types.enum, options: { enum: USER_TYPES } },
                },
            }));
            if (!validation.success)
                return res.status(400).json({ ...validation });

            const { firstName, lastName, type } = req.body;
            const user = await UserModel.createUser(firstName, lastName, type);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    },
    onDeleteUserById: async (req, res) => {
        try {
            const user = await UserModel.deleteByUserById(req.params.id);
            return res.status(200).json({
                success: true,
                message: `Deleted a count of ${user.deletedCount} user.`,
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error });
        }
    },
};
