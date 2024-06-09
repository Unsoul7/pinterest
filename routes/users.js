const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost:27017/pinterestdata')

const userModel = new Schema({
    email : {type : String, unique : true},
    password : {type : String},
    username : {type : String, unique: true},
    fullname : {type : String, default: 'No Name'},
    posts : [{type : mongoose.Schema.Types.ObjectId, ref : 'postModel'}],
    dp : {type : String, default : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'},
    dob : {type : Date},
    datecreated : {type : Date , default : Date.now}
})

userModel.plugin(plm)

module.exports = mongoose.model('userModel', userModel)