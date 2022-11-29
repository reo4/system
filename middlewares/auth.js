const auth = (req, res, next) => {
  if (req.session.auth) {
    if (req.path === '/login') {
      res.redirect('/')
    }
    else {
      next()
    }
  }
  else {
    if (req.path === '/') {
      res.redirect('/login')
    }
    else {
      next()
    }
  }
}

module.exports = auth