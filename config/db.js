if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://zapelini:zap01ok@blogapp-prod-m5sjd.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}