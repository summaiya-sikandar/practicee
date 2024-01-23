const mongoose = require('mongoose')
const plm= require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/attApp')

const userSchema= new mongoose.Schema({
      firstname: String,
      lastname: String,
      username: String,
      course: String,
      email: String,
      password: String,
      number:Number,
      file:String,
      role: String,
      attendence:[{
            type: Date,
            default: null,
      }]
})
userSchema.plugin(plm)

module.exports= mongoose.model('User',userSchema)
