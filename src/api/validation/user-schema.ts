import Joi from "joi";
import { joiPasswordExtendCore } from 'joi-password';
const JoiPassword = Joi.extend(joiPasswordExtendCore);

const userSchema = {
    registerBody: Joi.object().keys({
        name: Joi.string().not('').max(255).required(),
        password: JoiPassword.string().required(),
        email: Joi.string().email().not('').max(255).required(),
    }),
    updateProfile: Joi.object().keys({
        name: Joi.string().not('').max(255).required(),
        email: Joi.string().email().not('').max(255).required(),
    }),
    updateUserRole: Joi.object().keys({
        id: Joi.string().not('').required(),
        role: Joi.string().not('').required(),
    })
}

export default userSchema;