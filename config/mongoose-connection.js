mongoose= require("mongoose");

mongoose.connect("mongodb://localhost")
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log(err);
});

module.exports=(mongoose.connection);