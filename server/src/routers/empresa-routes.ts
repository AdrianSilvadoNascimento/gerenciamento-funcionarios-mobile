import express from 'express'
import EmpresaController from '../controllers/empresa-controller'

const router = express.Router()
const empresaController = new EmpresaController()

router.post('/cadastro', empresaController.cadastrarEmpresa)
router.post('/entrar', empresaController.logarEmpresa)
router.get('/', empresaController.getEmpresas)
router.get('/:id', empresaController.getEmpresa)

module.exports = router
