//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const db = require("./config/db")


//Configurações
    //Sessão
        app.use(session({
            secret: "cursoDeNode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //BodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise;
        //mongoose.connect("mongodb://localhost/blogapp", { useNewUrlParser: true }).then(() => {
        //mongoose.connect("mongodb+srv://zapelini:zap01ok@blogapp-prod-m5sjd.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true }).then(() => {
        mongoose.connect(db.mongoURI).then(() => {
            console.log("Conectado ao mongo!")
        }).catch((e) => {
            console.log("Erro ao conectar ao mongo: " + e)
        } )
    //public
        app.use(express.static(path.join(__dirname + "/public")))


//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categorias").sort({data: "desc"}).then((postagens) => {

            res.render("index", {postagens: postagens})
        }).catch((e) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta página não existe")
                res.redirect("/")
            }
        }).catch((e) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
        
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404')
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categoria/index", {categorias: categorias})
        }).catch((e) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) =>{
                    res.render("categoria/postagens", {postagens: postagens, categoria: categoria})
                }).catch((e) => {
                    req.flash("error_msg", "Houve um erro ao encontrar os posts desta categoria")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((e) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })



    app.use('/admin', admin)
    app.use("/usuarios", usuarios)




//Outros
    //const PORT = 8081
    //const PORT = 21001
    const PORT = process.env.PORT || 8089
    app.listen(PORT, () => {
        console.log("Servidor rodando!")
    })

