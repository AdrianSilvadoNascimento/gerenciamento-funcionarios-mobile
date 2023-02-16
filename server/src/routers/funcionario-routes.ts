import express from 'express'
import FuncionarioController from '../controllers/funcionario-controller'

const router = express.Router()
const funcionarioController = new FuncionarioController()

router.post('/cadastro/:id', funcionarioController.cadastrarFuncionarios)
router.get('/:id', funcionarioController.getFuncionarios)
router.get('/:id', funcionarioController.getFuncionario)
router.delete('/:id', funcionarioController.excluirFuncionario)

module.exports = router
