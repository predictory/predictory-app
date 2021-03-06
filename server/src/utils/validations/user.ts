import * as Joi from '@hapi/joi';
import { IUser, IUserRegister } from '../types/user';

const userSchema = {
    email: Joi.string().min(1).max(100).required().email(),
    password: Joi.string().min(1).max(255).required()
};

const userRegisterSchema = {
    ...userSchema,
    password: Joi.string().min(5).max(255).required(),
    name: Joi.string().min(1).max(100).required(),
    surname: Joi.string().min(1).max(100).required(),
    admin: Joi.boolean()
};

export const validateLogin = (user: any): Joi.ValidationResult<IUser> => {
    return Joi.validate(user, userSchema);
};

export const validateRegister = (user: any): Joi.ValidationResult<IUserRegister> => {
    return Joi.validate(user, userRegisterSchema);
};
