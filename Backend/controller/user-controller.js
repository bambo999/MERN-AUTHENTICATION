const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const signup = async (req, res) => {
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        console.log(err);
    }
    if (existingUser) {
        return res.status(422).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
        name,
        email,
        password : hashedPassword
    });

    try {
        await user.save();
    } catch (err) {
        console.log(err);
    }

    res.json({ message: user });
}


const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        console.log(err);
    }
    if (!existingUser) {
        return res.status(422).json({ error: 'Invalid email or password' });
    }
    isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        return res.status(422).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '35s' });
    
    console.log("Generater Token\n", token);

    if(req.cookies[`${existingUser._id}`]) {
        req.cookies[`${existingUser._id}`] = '';
    }

    res.cookie(String(existingUser._id), token, { path: '/',
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: 'lax',
});

    return res.status(200).json({ message: 'Login successful', user: existingUser, token });
}

const verifyToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const token = cookies.split('=')[1];
    console.log(cookies);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(String(token), process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.log(user.id);
        req.id = user.id;
    });
    next();
};

const getUser = async (req, res, next) => {
    const userId = req.id;
    let user;
    try {
        user = await User.findById(userId, "-password");
    }
    catch (err) {
        return new Error(err);
    }
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
};

const refreshToken =  (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevToken = cookies.split('=')[1];
    if(!prevToken) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(String(prevToken), process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`]='';

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY,{ 
            expiresIn: '35s' 
        });
   
    console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, { path: '/',
    expires: new Date(Date.now() + 3600000),
    httpOnly: true,
    sameSite: 'lax',
});
    req.id = user.id;
    next();
});

}


const logout = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevtoken = cookies.split('=')[1];
    if (!prevtoken) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(String(prevtoken), process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`]='';
        return res.status(200).json({ message: 'Logout successful' });

   
})    
}


 
module.exports = { signup, login, verifyToken, getUser, refreshToken, logout };