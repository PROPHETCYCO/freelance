import mongoose from "mongoose";
//import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    mySponsorId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String, // Preferred Customer Name
        required: true,
    },
    mobileNumber: {
        type: String, // Mobile Number
        required: true,
        unique: true,
    },
    email: {
        type: String, // Email ID
        required: true,
        unique: true,
        lowercase: true,
    },
    pin: {
        type: String, //address pin code
        required: true,
    },
    password: {
        type: String, // Password
        required: true
    },
    sponsorId: {
        type: String,
        required: true,
    },
    parentSponsorId: {
        type: String,
        default: null,
    },
    referredIds: {
        type: [String],
        default: [],
    },
    subcription: {
        type: String,
        default: "None",
    },
    leftRefferalLink: {
        type: String,
        required: true,
        unique: true,
    },
    rightRefferalLink: {
        type: String,
        required: true,
        unique: true,
    },
    binaryPosition: {
        left: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Binary positions refer to other users
        },
        right: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Binary positions refer to other users
        }
    },
    bvPoints: {
        type: Number,
        default: 0,
    },
    // ---------------------------------------------------------------------------------------------
    isActive: {
        type: Boolean,
        default: false,
    },
    activeDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    uniqueKey: {
        type: String,
        unique: true, // Ensure uniqueness
        required: true,
    }
});

export default mongoose.model("User", userSchema);