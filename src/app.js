require('./routes')
const { restoreSessions } = require('./sessions')
const { routes } = require('./routes')
const app = require('express')()
const bodyParser = require('body-parser')
const { maxAttachmentSize } = require('./config')

// Configuração de CORS
app.use((req, res, next) => {
  // Permitir requisições do frontend (porta 3000)
  res.header('Access-Control-Allow-Origin', process.env.FRONT_URL);
  
  // Permitir métodos HTTP
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Permitir headers (incluindo 'x-api-key' que é enviado pelo frontend)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  
  // Permitir credenciais
  res.header('Access-Control-Allow-Credentials', true);
  
  // Responder ao preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize Express app
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: maxAttachmentSize + 1000000 }))
app.use(bodyParser.urlencoded({ limit: maxAttachmentSize + 1000000, extended: true }))
app.use('/', routes)

restoreSessions()

module.exports = app
