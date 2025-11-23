const auth = require("../models/auth.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const postRegister = async (req, res) => {
    try {
        const { name, email, password} = req.body;
        let existingUser = await auth.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "user already exist" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new auth({ name, email, password: hashedPassword, role: "user" });
        await user.save()      
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15d' }
        )
        res.status(201).json({
            message: "user registered successfully!", token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.findOne({ email });
        if (!user) return res.status(400).json({ message: "user not found" });
        if(user.isBlocked) return res.status(403).json({ message: "Your account is blocked. Contact admin." });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: "invalid password" });
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
        )
        res.status(200).json({
            message: "login successful!",
            token, user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const getUser = async (req, res) => {
    try {
        const user = await auth.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: 'user not found' });
        res.status(200).json({ message: "protected data", user });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await auth.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "user not found" });
        const { currentPassword, newPassword } = req.body;
        const isMatched = await bcrypt.compare(currentPassword, user.password);
        if (!isMatched) return res.status(400).json({ message: "current password is incorrect" });
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(400).json({ message: "new password cannot be same as current password" })
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: "Password updated successfully" })
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if(req.user.role!=='admin' && req.user.id !== id) return res.status(403).json({message: 'You are not allowed to delete this user'})
        const deletedUser = await auth.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: "user not found" });
        res.status(200).json({ message: "user deleted successfully!" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const getAdmin = async (req, res) => {
    const user = await auth.findById(req.user.id).select("-password");
    res.status(200).json({ message: `Welcome, ${user.name} `, user });
}

const getAllUsers = async (req, res) => {
    try {
        const users = await auth.find().select("-password");
        res.status(200).json({ message: "All users fetched successfully" , users })
    }catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const blockUser = async(req, res)=>{
    try{
        const { id } = req.params;
        const user = await auth.findById(id);
        if(!user) return res.status(404).json({message: "User not found"})
        user.isBlocked = !user.isBlocked
        await user.save();
        res.status(200).json({
            message: user.isBlocked ? "User Blocked" : "User Unblocked",
            user
        })
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const makeAdmin = async(req, res)=>{
    try{
        const {id} = req.params;
        const user = await auth.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.role = "admin";
        await user.save();
        res.status(200).json({ message: "User is now Admin", user })
    }catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { postRegister, postLogin, getUser, updateUser, deleteUser, getAdmin, getAllUsers, blockUser, makeAdmin};
