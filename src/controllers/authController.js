import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { findPositionAndAttach, placeInLeftSideOfTree, placeInRightSideOfTree } from "../utils/placeInBinaryTree.js";


// Function to generate unique sponsor ID
async function generateUniqueSponsorID() {
    let isUnique = false;
    let randomNumber;

    while (!isUnique) {
        randomNumber = generateRandom7DigitNumber();
        const existingUser = await User.findOne({ sponsorId: `AB${randomNumber}` });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return `AB${randomNumber}`;
}


// Function to generate random 7-digit number
function generateRandom7DigitNumber() {
    return Math.floor(1000000 + Math.random() * 9000000);
}


// Funtion to Generate Unique Key
async function generateUniqueKey() {
    let key;
    let existingUser;
    do {
        key = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit random key
        existingUser = await User.findOne({ uniqueKey: key }); // Check if it already exists
    } while (existingUser); // If key exists, generate a new one
    return key;
}



// Register First User
async function handleRegisterFirstUser(req, res) {
    try {
        const count = await User.countDocuments();
        if (count !== 0) {
            return res.status(404).json({ message: "First user already exists!" });
        }

        if (count === 0) {
            const { name, mobileNumber, email, pin, password } = req.body;

            // Check all parameters are received or not
            if (!name || !mobileNumber || !email || !pin || !password) {
                return res.status(400).json({ message: "Please provide all required fields" });
            }

            // First user registration (admin/root user)
            let generatedSponsorId = await generateUniqueSponsorID();
            const leftRefferalLink = `https://demo.com/userdashboard/signupleft/${generatedSponsorId}`;
            const rightRefferalLink = `https://demo.com/userdashboard/signupright/${generatedSponsorId}`;

            // Generate a unique 5-digit key
            const uniqueKey = await generateUniqueKey();

            // Create a new user
            const newUser = await User.create({
                sponsorId: generatedSponsorId,
                name,
                mobileNumber,
                email,
                pin,
                password,
                parentSponsorId: "",
                mySponsorId: generatedSponsorId,
                leftRefferalLink,
                rightRefferalLink,
                uniqueKey,
            });

            // Send email notification
            //await sendEmailNotification(email, name, generatedSponsorId, password, uniqueKey);

            return res
                .status(201)
                .json({ message: "First user registered successfully", user: newUser });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
}


//Register User with Sponsor
async function handleRegisterUser(req, res) {
    try {
        const count = await User.countDocuments();
        if (count === 0) { return res.status(404).json({ message: 'No tree exists. Firstly Register root user.' }) }

        const {
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password
        } = req.body;

        // Check all parameters are recieved or not 
        if (!sponsorId || !name || !mobileNumber || !email || !pin || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if the Sponsor ID exists in the database
        const sponsor = await User.findOne({ mySponsorId: sponsorId });
        if (!sponsor) { return res.status(400).json({ message: 'Invalid Sponsor ID' }); }

        // Check if email is already registered
        let userFound = await User.findOne({ email: email });
        if (userFound) { return res.status(404).json({ message: 'Email is already registered' }); }

        // Check if Phone is already registered
        let phoneFound = await User.findOne({ mobileNumber: mobileNumber });
        if (phoneFound) { return res.status(404).json({ message: 'Phone number is already registered' }); }




        // Generate a unique mySponsorId
        let generatedSponsorId = await generateUniqueSponsorID();
        const leftRefferalLink = `https://demo.com/userdashboard/signupleft/${generatedSponsorId}`;
        const rightRefferalLink = `https://demo.com/userdashboard/signupright/${generatedSponsorId}`;

        // Generate a unique 5-digit key
        const uniqueKey = await generateUniqueKey();

        // Create new user
        const newUser = await User.create({
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password,
            parentSponsorId: '',
            mySponsorId: generatedSponsorId,
            leftRefferalLink,
            rightRefferalLink,
            uniqueKey
        });


        // If user registered with a referral link, update parent user’s referredIds
        if (sponsorId) {
            await User.updateOne(
                { mySponsorId: sponsorId },
                { $push: { referredIds: newUser.mySponsorId } }
            );
        }

        // Attach to sponsor's binary tree
        await findPositionAndAttach(sponsor, newUser);
        //const emailResponse = await sendEmailNotification(email, name, generatedSponsorId, password, uniqueKey);

        // if (emailResponse === 'error') {
        //     console.error('Failed to send registration email.');
        // }
        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


//Register User With Left Link
async function handleRegisterUsingLeftLink(req, res) {
    try {
        // New user details
        const {
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password
        } = req.body;

        // Check all parameters are recieved or not 
        if (!sponsorId || !name || !mobileNumber || !email || !pin || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if the Sponsor ID exists in the database
        const sponsor = await User.findOne({ mySponsorId: sponsorId });
        if (!sponsor) { return res.status(400).json({ message: 'Invalid Sponsor ID' }); }

        // Check if email is already registered
        let userFound = await User.findOne({ email: email });
        if (userFound) { return res.status(404).json({ message: 'Email is already registered' }); }

        // Check if Phone is already registered
        let phoneFound = await User.findOne({ mobileNumber: mobileNumber });
        if (phoneFound) { return res.status(404).json({ message: 'Phone number is already registered' }); }


        // Generate a unique mySponsorId
        let generatedSponsorId = await generateUniqueSponsorID();
        const leftRefferalLink = `https://demo.com/userdashboard/signupleft/${generatedSponsorId}`;
        const rightRefferalLink = `https://demo.com/userdashboard/signupright/${generatedSponsorId}`;

        // Generate a unique 5-digit key
        const uniqueKey = await generateUniqueKey();

        // Create new user
        const newUser = await User.create({
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password,
            parentSponsorId: '',
            mySponsorId: generatedSponsorId,
            leftRefferalLink,
            rightRefferalLink,
            uniqueKey
        });

        if (sponsorId) {
            await User.updateOne(
                { mySponsorId: sponsorId },
                { $push: { referredIds: newUser.mySponsorId } }
            );
        }

        // Attach to sponsor's binary tree
        await placeInLeftSideOfTree(sponsor, newUser);
        //const emailResponse = await sendEmailNotification(email, name, generatedSponsorId, password, uniqueKey);

        // if (emailResponse === 'error') {
        //     console.error('Failed to send registration email.');
        // }
        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


//Register User With Right Link
async function handleRegisterUsingRightLink(req, res) {
    try {
        // New user details
        const {
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password
        } = req.body;

        // Check all parameters are recieved or not 
        if (!sponsorId || !name || !mobileNumber || !email || !pin || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if the Sponsor ID exists in the database
        const sponsor = await User.findOne({ mySponsorId: sponsorId });
        if (!sponsor) { return res.status(400).json({ message: 'Invalid Sponsor ID' }); }

        // Check if email is already registered
        let userFound = await User.findOne({ email: email });
        if (userFound) { return res.status(404).json({ message: 'Email is already registered' }); }

        // Check if Phone is already registered
        let phoneFound = await User.findOne({ mobileNumber: mobileNumber });
        if (phoneFound) { return res.status(404).json({ message: 'Phone number is already registered' }); }


        // Generate a unique mySponsorId
        let generatedSponsorId = await generateUniqueSponsorID();
        const leftRefferalLink = `https://demo.com/userdashboard/signupleft/${generatedSponsorId}`;
        const rightRefferalLink = `https://demo.com/userdashboard/signupright/${generatedSponsorId}`;

        // Generate a unique 5-digit key
        const uniqueKey = await generateUniqueKey();

        // Create new user
        const newUser = await User.create({
            sponsorId,
            name,
            mobileNumber,
            email,
            pin,
            password,
            parentSponsorId: '',
            mySponsorId: generatedSponsorId,
            leftRefferalLink,
            rightRefferalLink,
            uniqueKey
        });

        if (sponsorId) {
            await User.updateOne(
                { mySponsorId: sponsorId },
                { $push: { referredIds: newUser.mySponsorId } }
            );
        }

        // Attach to sponsor's binary tree
        await placeInRightSideOfTree(sponsor, newUser);
        //const emailResponse = await sendEmailNotification(email, name, generatedSponsorId, password, uniqueKey);

        // if (emailResponse === 'error') {
        //     console.error('Failed to send registration email.');
        // }

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


//Login User
async function handleLoginUser(req, res) {
    try {
        const { sponsorId, password } = req.body;
        if (!sponsorId || !password) { return res.status(400).json({ message: 'Please enter both sponsorId and password' }); }

        // Check user exists OR not
        let user = await User.findOne({ mySponsorId: sponsorId });
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        // Check password is correct OR not
        if (user.password === password) {
            const payload = { email: user.email, id: user._id, role: 'user' };
            const token = generateToken(payload);
            return res.status(200).json({ token, user });
        } else {
            return res.status(404).json({ message: 'Incorrect userId OR password.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export { handleRegisterFirstUser, handleRegisterUser, handleRegisterUsingLeftLink, handleRegisterUsingRightLink, handleLoginUser };