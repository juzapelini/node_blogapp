const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


    router.get("/registro", (req, res) => {
        res.render("usuarios/registro")
    })

    router.post("/registro", (req, res) => {
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"})
        }

        if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
            erros.push({texto: "E-mail inválido"})
        }

        if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
            erros.push({texto: "Senha inválida"})
        }

        if(req.body.senha.length < 4){
            erros.push({texto: "Senha deve ter no mínimo quatro caracteres"})
        }

        if(!req.body.senha2 || typeof req.body.senha2 == undefined || req.body.senha2 == null){
            erros.push({texto: "Repita a senha novamente"})
        }

        if(req.body.senha !=  req.body.senha2){
            erros.push({texto: "As senhas são diferentes"})
        }

        if(erros.length > 0){
            res.render("/usuarios/registro", {erros: erros})
        }else{
            Usuario.findOne({email: req.body.email}).then((usuario) =>{
                if(usuario){
                    req.flash("error_msg", "Já existe uma conta com este e-mail")
                    res.redirect("/usuarios/registro")
                }else{
                    const novoUsuario = {
                        nome:   req.body.nome,
                        email:  req.body.email,
                        senha:  req.body.senha,
                        //eAdmin: 1
                    }
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                            if(erro){
                                req.flash("erro_msg", "Erro ao cryptografar a senha")
                                res.redirect("/usuarios/registro")
                            }
                            novoUsuario.senha = hash
                            new Usuario(novoUsuario).save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso")
                                res.redirect("/")
                            }).catch((e) =>{
                                req.flash("error_msg", "Erro ao cadastrar Usuario: " + e)
                                res.redirect("/usuarios/registro")
                            })
                        })
                    })
                }

            }).catch((e) =>{
                req.flash("error_msg", "Houve um erro interno ao consultar usuário: " + e)
                res.redirect("/")
            })
        }
    })

    router.get("/login", (req, res) => {
        res.render("usuarios/login")
    })

    router.post("/login", (req, res, next) => {
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/usuarios/login",
            failureFlash: true

        })(req, res, next)
    })

    router.get("/logout", (req, res) => {
        req.logOut()
        req.flash("success_msg", "Logout com sucesso")
        res.redirect("/")
    })

module.exports = router