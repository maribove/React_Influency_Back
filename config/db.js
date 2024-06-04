const mongoose = require ("mongoose")
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS


// conexão com banco
const conn = async () => { 
    try {
        const dbConn = await mongoose.connect(
            `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rdufh7t.mongodb.net/`);
        console.log("Conectou ao banco!")
        return dbConn
    }catch (error){
        console.log(error)

    }
} 

conn()

module.exports = conn