import { Express } from 'express'
import express from 'express'
import cors from 'cors'
import * as bodyParser from 'body-parser'

const empresaRoutes = require('./routers/empresa-routes')
const funcionarioRoutes = require('./routers/funcionario-routes')

const PORT: string | number = process.env.PORT || 3004
const app: Express = express()

app.use(cors())
app.use(bodyParser.json())

app.use('/empresa', empresaRoutes)
app.use('/funcionario', funcionarioRoutes)

app.listen(PORT, () => {
  console.log(`Server is running in port: ${PORT}`)
})
