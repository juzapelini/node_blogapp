const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin.js")

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina POSTS")
})

router.get('/categorias',  eAdmin, (req, res) => {
    console.log(eAdmin)
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((e) => {
        req.flash("error_msg", "Houve um erro ao listas as categorias: " + e)
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add',  eAdmin, (req, res) => {
    res.render("admin/addCategorias")
})

router.post("/categorias/nova",  eAdmin, (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((e) =>{
            req.flash("error_msg", "Erro ao cadastrar Categoria: " + e)
            console.log("Erro ao cadastrar Categoria: " + e)
            res.redirect("/admin")
        })
    }
})

router.get('/categorias/edit/:id',  eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editCategorias", {categoria: categoria})
    }).catch((e) => {
        req.flash("error_msg", "Esta categoria nao existe: " + e)
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/edit',  eAdmin, (req, res) => {
    //fazer validacao dos campos

    Categoria.findOne({_id:req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        
        categoria.save().then(() =>{
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias") 
        }).catch((e) => {
            req.flash("error_msg", "Erro ao salvar o editar: " + e)
            res.redirect("/admin/categorias")
        })
    }).catch((e) => {
        req.flash("error_msg", "Erro ao editar: " + e)
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar',  eAdmin, (req, res) => {
    //fazer validacao dos campos

    Categoria.remove({_id: req.body.id}).then((categoria) => {
        req.flash("success_msg", "Categoria excluida com sucesso")
        res.redirect("/admin/categorias") 
    }).catch((e) => {
        req.flash("error_msg", "Erro ao excluir: " + e)
        res.redirect("/admin/categorias")
    })
})

// ============ POSTAGENS ============ 

router.get('/postagens',  eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((e) => {
        req.flash("error_msg", "Erro ao encontrar Postagens: " + e)
        res.redirect("/admin")
    })
    
})

router.get('/postagem/add',  eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addPostagem", {categorias: categorias})
    }).catch((e) => {
        req.flash("error_msg", "Erro ao encontrar Categorias: " + e)
        res.redirect("/admin/postagens")
    })
})


router.post("/postagem/nova",  eAdmin, (req, res) => {

    var erros = []
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválido"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválido"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagem", {erros: erros})
    }else{
        console.log(req.body.categoria)
        const novaPostagem = {
            titulo:     req.body.titulo,
            descricao:  req.body.descricao,
            conteudo:   req.body.conteudo,
            categoria:  req.body.categoria,
            slug:       req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((e) =>{
            req.flash("error_msg", "Erro ao cadastrar Postagem: " + e)
            console.log("Erro ao cadastrar Postagem: " + e)
            res.redirect("/admin/postagens")
        })
    }
})


router.get('/postagem/edit/:id',  eAdmin,  (req, res) => {
    


    Postagem.findOne({_id:req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
              
            let select_filter = []
            categorias.forEach(categoria => {
                console.log(categoria.id)
                console.log(postagem.categoria)
                if (categoria.id == postagem.categoria) {
                    console.log("TRUE")
                    select_filter.push({
                        id: categoria.id,
                        nome: categoria.nome,
                        selected: true
                    })
                } else {
                    console.log("FALSE")
                    select_filter.push({
                        id: categoria.id,
                        nome: categoria.nome,
                        selected: false
                    })
                }
            })
            res.render("admin/editPostagem", {select_filter: select_filter, categorias: categorias , postagem: postagem})
        }).catch((e) => {
            req.flash("error_msg", "Erro ao listar Categorias: " + e)
            res.redirect("/admin/postagens")
        })
        
    }).catch((e) => {
        req.flash("error_msg", "Esta postagem nao existe: " + e)
        res.redirect("/admin/postagens")
    })
})

router.post('/postagem/edit',  eAdmin, (req, res) => {
    //fazer validacao dos campos

    Postagem.findOne({_id:req.body.id}).then((postagem) => {

        postagem.titulo         = req.body.titulo,
        postagem.descricao      = req.body.descricao,
        postagem.conteudo       = req.body.conteudo,
        postagem.categoria      = req.body.categoria,
        postagem.slug           = req.body.slug
        
        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens") 
        }).catch((e) => {
            req.flash("error_msg", "Erro ao salvar o editar: " + e)
            res.redirect("/admin/postagens")
        })
    }).catch((e) => {
        req.flash("error_msg", "Erro ao editar: " + e)
        res.redirect("/admin/postagens")
    })
})

router.post('/postagem/deletar',  eAdmin, (req, res) => {

    Postagem.remove({_id: req.body.id}).then((postagem) => {
        req.flash("success_msg", "Postagem excluida com sucesso")
        res.redirect("/admin/postagens") 
    }).catch((e) => {
        req.flash("error_msg", "Erro ao excluir: " + e)
        res.redirect("/admin/postagens")
    })
})




//sempre no final
module.exports = router