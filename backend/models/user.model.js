import mongoose from "mongoose";    

//creating schema
const userSchema = mongoose.Schema({
    username: {type:String, required: true},
    email: {type:String, required: true},
    password: {type:String, required: true}
});

//creating model
const User = mongoose.models.User || mongoose.model("User",userSchema);

//export to use in other page
export default User;
