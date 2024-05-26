const { createHmac,randomBytes} = require('node:crypto');
const {Schema,model} = require('mongoose');
const {createTokenForUser} = require('../services/authentication')


const userSchema = new Schema({
    fullName: {
        type : String,
        required: true,
    },
    email: {
        type : String,
        required: true,
        unique: true,
    },
    salt: {
        type : String,
        
    },
    password: {
        type : String,
        required: true,
    },
    profileimageURL: {
        type:String,
        default:"Images/default.jpg"
    },
  role:{
    type:String,
    enum:["USER","ADMIN"],
    default:"USER",
   }

},{timestamps:true});


userSchema.pre("save", function(next){
    const user = this;

    if(!user.isModified('password')) return;
    
    const salt = randomBytes(16).toString();

    const hashedpassword = createHmac('sha256',salt)
        .update(user.password)
        .digest('hex')

         this.salt = salt;
         this.password = hashedpassword;
      
         next();
});


userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
       const user = await this.findOne({email});
       

       if(!user) throw new Error('User not found');
      
       const salt = user.salt;
       const HashedPassword = user.password;

        const userProvidedHash = createHmac('sha256',salt)
        .update(password)
        .digest('hex');
        
       
        if(userProvidedHash !== HashedPassword)  throw new Error('Incorrect Password'); 

        // return {...user,password: undefined,salt: undefined};
        const token = createTokenForUser(user);
        
        return token;
})


const user = model('user',userSchema);

module.exports = user;