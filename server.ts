require('dotenv').config();
import {app} from './src/app';
import connectDB from './src/db/connectDB';
import {v2 as cloudinary} from 'cloudinary';

//config cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY
})

const PORT = process.env.PORT || 3001;

//connect DB
connectDB();

//create server
app.listen(PORT, () => {
    console.log(`Server is connected with port ${PORT}`);
})