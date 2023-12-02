const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userEmail: String,
    reviewVisibility: Boolean,
    comment: String,
    rating: Number,
});

const listSchema = new mongoose.Schema({
    Heroes: {},
    description: String,
    dateModified: String,
    visibilityFlag: String,
    reviews: {
        type: Map,
        of: reviewSchema,
    },
});


const dataSchema = new mongoose.Schema({
    email: { required: true, type: String },
    username: String,
    password: String,
    nickname: String,
    isAuth: Boolean,
    isAdmin: Boolean,
    isDisabled: Boolean,
    lists: {
        type: Map,
        of: listSchema,
    }
});

module.exports = mongoose.model('Data', dataSchema)