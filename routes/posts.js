const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postModel = new Schema({
    image : {type : String},
    title : {type : String},
    description : {type : String},
    link : {type : String},
    tags : {type : String},
    userid : {type : mongoose.Schema.Types.ObjectId, ref : 'userModel'},
    datecreated : {type : Date , default : Date.now}
})

module.exports = mongoose.model('postModel', postModel)