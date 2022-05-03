import mongoose from "mongoose";
 const Schema= mongoose.Schema
const UserSchema= new Schema({
    name:{type: String, required: false},
    publicKey: {type: Array, required: true}
})

export default mongoose.model('userDetail', UserSchema);