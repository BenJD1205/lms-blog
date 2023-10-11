import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    avatar:{
        public_id:string;
        url:string;
    },
    role:string;
    isVerified:boolean;
    courses: Array<{courseId:string}>;
    accessToken: () => string;
    refreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please enter your name'],
    },
    email:{
        type:String,
        required:[true, 'Please enter your email'],
        validate:{
            validator: function (value:string) {
                return emailRegexPattern.test(value);
            },
            message:'please enter a valid email'
        },
        unique:true,
    },
    password:{
        type:String,
        required:[true, 'Please enter your password'],
        minLength:[6, 'Password must be at least 6 characters'],
    },
    avatar:{
        public_id:String,
        url:String,
    },
    role:{
        type:String,
        default:'user',
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    courses:[
        {
            courseId:String,
        }
    ]
}, {timestamps: true})


//Hash password before saving
userSchema.pre<IUser>('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//access token
userSchema.methods.accessToken = function (){
    return jwt.sign({id:this._id}, process.env.ACCESS_TOKEN || '')
}

//refresh token
userSchema.methods.refreshToken = function (){
    return jwt.sign({id:this._id}, process.env.REFRESH_TOKEN || '')
}

//compare password
userSchema.methods.comparePassword = async function(enteredPassword:string):Promise<boolean>{
    return await bcrypt.compare(enteredPassword,this.password);
}

const userModel: Model<IUser> = mongoose.model('User', userSchema);
export default userModel;