const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users = require('../models/auth');
const { configuremail, sendLoginMail } = require('../helpers/common');

const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(404).json({ success: false, message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await users.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ email: newUser.email, id: newUser._id }, "yourSecretKey", { expiresIn: '1h' });
        res.status(200).json({ success: true, result: newUser, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong..." });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await users.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User doesn't exist" });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, "yourSecretKey", { expiresIn: '1h' });
        res.status(200).json({ success: true, result: existingUser, token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong..." });
    }
};

const forgotpassword = async (req, res) => {
    const { email } = req.body;
    try {
        const oldUser = await users.findOne({ email });
        if (!oldUser) {
            return res.json({ success: false, message: "User Does Not Exist" });
        }
        const secret = "yourSecretKey" + oldUser.password;
        const token = jwt.sign({ id: oldUser._id }, secret, { expiresIn: "1d" });
        const link = `http://localhost:5000/user/resetpassword/${oldUser._id}/${token}`;
        
        // Using the configured mail transporter and sendLoginMail function
        const transporter = await configuremail();
        const response = await sendLoginMail(transporter, req.body.email, link);
        return res.status(200).json({ success: true, message: "Reset password email sent successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong..." });
    }
};

const resetpassword = async (req, res) => {
    const { id, token } = req.params;

    try {
        const oldUser = await users.findOne({ _id: id });

        if (!oldUser) {
            return res.status(404).json({ success: false, message: "User Not Exists!", status: "Not Verified" });
        }

        const secret = "yourSecretKey" + oldUser.password; // Verify if this is the correct secret
        const verify = jwt.verify(token, secret);
        const email = verify.email;

        if (req.method === 'POST') {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ success: false, message: "Password is required" });
            }

            const encryptedPassword = await bcrypt.hash(password, 12);
            await users.updateOne(
                { _id: id },
                { $set: { password: encryptedPassword } }
            );

            // Password reset successful, send alert and redirect to home
            return res.send("<script>alert('Do you want to Login?'); window.location.href='http://localhost:3000/user/login';</script>");
        } else {
            // Render index.ejs with verified status
            return res.render("index", { email: email ,status:"Verified"});
        }
    } catch (err) {
        return res.send("Not verified");
    }
};

module.exports = {
    signup,
    login,
    forgotpassword,
    resetpassword
};
