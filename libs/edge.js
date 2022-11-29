const { Edge } = require('edge.js')
const { join } = require('path')

const edge = new Edge({ cache: false })

edge.mount(join(__dirname, 'views'))

const registerEdge = app => {
  app.engine('edge', (filePath, options, callback) => {
    const rendered = edge.renderSync(filePath, options)
    return callback(null, rendered)
  })

  app.set("view engine", "edge");
}



module.exports = registerEdge