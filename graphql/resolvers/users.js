const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    }, SECRET_KEY, {expiresIn: '1h'});
}

module.exports = {
    Mutation: {
        async login(_, { username, password }){
            const { errors, valid } = validateLoginInput(username, password);
            const user = await User.findOne({ username });

            if(!user){
                errors.general = 'User not found.';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = "Wrong credentials";
                throw new UserInputError('Wrong credentials.', { errors });
            }
            
            const token = generateToken(user);
            return{
                ...user._doc,
                id: user._id,
                token
            }
        }, 
        async register(_, { //register section
            registerInput: { username, email, password, confirmPassword}
        }, 
        context, 
        info){
            // Validate user Data.
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors',{ errors });
            }
            // TODO: make sure user doesnt already exist

            const user = await User.findOne({ username });
            const unqEmail = await User.findOne({ email });
            if(user){
                throw new UserInputError('Username is taken.',{
                    errors: {
                        username: 'This username is taken.'
                    }
                });
            }

            if(unqEmail){
                throw new UserInputError('Email is already in use.', {
                    errors: {
                        email: 'Email is already in use.'
                    }
                })
            }


            password = await bcrypt.hash(password, 12);

            const newUser = new User({email,
                username,  
                password, 
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);
            return{
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
};