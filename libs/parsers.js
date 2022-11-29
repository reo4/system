const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

const registerParsers = app => {
  app.use(cookieParser())
  app.use(session({
    cookie: {},
    resave: true,
    saveUninitialized: true,
    secret: 'keyboard cat'
  }));
  app.use(flash());
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
}


module.exports = registerParsers