var express = require('express');
var router = express.Router();
var tablas = require("../models");
const ofertas = require('../models/ofertas');
var Users = tablas.Users;
var Ofertas = tablas.Ofertas;
var Comments = tablas.Comments;
var Userscomments = tablas.Userscomments
var Usersposts = tablas.Usersposts
let views = 0;
var userbannedlike = []
var userbanneddislike = []
var userbannedlikecomment = []
var userbanneddislikecomment = []

async function getofertas(){
  var ofertas = await Ofertas.findAll({
    nest: true,
    raw: true,
    include: [ 
      {
          model: Users,
          as: "user",
      }
  ]
  });
  return ofertas;
}

async function getrecentposts(){
  var ofertas = await Ofertas.findAll({
    nest: true,
    raw: true,
    limit: 4,
    order: [
      ['createdAt', 'DESC']
    ],
    include: [ 
      {
          model: Users,
          as: "user",
      }
  ]
  });
  return ofertas;
}

async function getcomments(){
  var comments = await Comments.findAll({
    nest: true,
    raw: true,
    include: [
      {
          model: Users,
          as: "user",
      }
  ]
  });
  return comments;
}

router.get('/', async function(req, res, next) {
  var posts = await getposts();
  res.send({posts});
});

router.get('/comments', async function(req, res, next) {
  var comments = await getcomments();
  res.send({comments});
});

router.post('/publicaciones', async function(req, res, next) {
  var newpost = req.body;
  var comments = await getcomments();
  var post = await Posts.create({
    title: newpost.title,
    description: newpost.description,
    iduser: newpost.iduser,
    filter: newpost.filter,
    likes: newpost.likes,
    dislikes: newpost.dislikes
  });
  await Usersposts.create({
    postid: post.id, 
    userid: newpost.iduser
  });
  res.send({
    status : true,
  });
});

router.get('/goToPage/:idPage', async function(req, res, next) {
    var id = req.params.idPage
    res.render('foro', { id })
  });

router.get('/iroferta/:idoferta', async function(req, res, next) {
  const offer = await getofertas();
  var ofertas = await getofertas();
  var comments = await getcomments();
  var idoferta = req.params.idoferta;
  var oferta = ofertas.find(oferta => {
    return(oferta.id == idoferta);
  });
  var comentario = comments.filter(comentario => {
    return(comentario.idpost == idoferta);
  });
  res.render('oferta', {oferta, comentario, offer})
});

router.post('/subircomentario', async function(req, res, next) {
  var newcomment = req.body;
  var comment = await Comments.create({ 
    nest: true,
    raw: true,
    idpost: newcomment.idpost,
    comment: newcomment.comment,
    likes: 0,
    dislikes: 0
  });
  await Userscomments.create({
    commentid: comment.id, 
    userid: newcomment.iduser
  });
  res.send({
    status : true
  });
});

router.get('/addlikepost/:like/:iduser', async function(req, res, next) {
  var idpost = req.params.like
  var iduser = req.params.iduser
  var userlike = await Posts.findByPk(idpost)
  var userIndex = userbannedlike.indexOf("iduser")
  if(userbannedlike[0] == iduser){
    userlike.decrement("likes")
    userbannedlike.splice(userIndex,1)
    res.redirect(req.get('referer'));
  }
  else{
    userlike.increment("likes")
    userlike.increment("xp", {by: 10})
    userbannedlike.push(iduser)
    res.redirect(req.get('referer'));
  }
});


router.get('/adddislikepost/:dislike/:iduser', async function(req, res, next) {
  var idpost = req.params.dislike
  var iduser = req.params.iduser
  var userdislike = await Posts.findByPk(idpost)
  var userIndex = userbanneddislike.indexOf("iduser")
  if(userbanneddislike[0] == iduser){
    userdislike.decrement("dislikes")
    userdislike.decrement("xp", {by: 10})
    userbanneddislike.splice(userIndex,1)
    res.redirect(req.get('referer'));
  }
  else{
    userdislike.increment("dislikes")
    userbanneddislike.push(iduser)
    res.redirect(req.get('referer'))
  }
});

router.get('/addlikecomment/:likecomment', async function(req, res, next) {
  var userid = req.app.locals.userlogged // ES UN OBJETO NO UNA ID
  var idcomment = req.params.likecomment
  var likecomment = await Comments.findByPk(idcomment)
  var userIndex = userbannedlikecomment.indexOf("iduser")
  if(userbannedlikecomment[0] == userid.id){
    likecomment.decrement("likes")
    userbannedlikecomment.splice(userIndex,1)
    res.redirect(req.get('referer'));
  }
  else{
    await Users.increment("level", {
      by: 10,
      where: {
        id: userid.id
      }
    })
    userbannedlikecomment.push(userid.id)
    likecomment.increment("likes")
    res.redirect(req.get('referer'))
  }
});

router.get('/adddislikecomment/:dislikecomment', async function(req, res, next) {
  var userid = req.app.locals.userlogged
  var idcomment = req.params.dislikecomment
  var dislikecomment = await Comments.findByPk(idcomment)
  var userIndex = userbanneddislikecomment.indexOf("iduser")
  if(userbanneddislikecomment[0] == userid.id){
    dislikecomment.decrement("dislikes")
    userbanneddislikecomment.splice(userIndex,1)
    res.redirect(req.get('referer'));
  }
  else{
    userbanneddislikecomment.push(userid.id)
    dislikecomment.increment("dislikes")
    dislikecomment.decrement("xp", {by: 10})
    res.redirect(req.get('referer'))
  }
});

router.get('/filter/:filter', async function(req, res, next) {
  var ofertas = await getofertas();
  var filter = req.params.filter;
  var ofertas = ofertas.filter(oferta => {
    return(oferta.filter == filter);
  });
  res.render('foro', {ofertas, filter})
});

router.get('/articuloseinstalaciones/:idPage/:filter', async function(req, res, next) {
  var filter = req.params.filter
  var ofertas = await getofertas();
  if(filter == "Todos"){
    const ofertas = await getofertas();
    var recentpublications = await getrecentposts();
    const comments = await getcomments();
    res.render('articuloseinstalaciones', {ofertas, recentpublications, filter, comments})
  }
  var ofertas = ofertas.filter(oferta => {
    return(oferta.filter == filter);
  });
  const comments = await getcomments();
  var recentpublications = await getrecentposts();
  res.render('articuloseinstalaciones', {ofertas, recentpublications, filter, comments})
});

router.get('/articuloseinstalacionescategory/:idPage/:category', async function(req, res, next) {
  var category = req.params.category
  var ofertas = await getofertas();
  if(category == "Todos"){
    const ofertas = await getofertas();
    res.render('articuloseinstalaciones', {ofertas, category})
  }
  var ofertas = ofertas.filter(oferta => {
    return(oferta.category == category);
  });
  res.render('articuloseinstalaciones', {ofertas, category})
});

  router.get('/crearpublicacion', async function(req, res, next) {
    await countPosts()
  res.render('crearpublicacion')
});

module.exports = router;