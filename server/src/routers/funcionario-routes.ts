import express from 'express'
import FuncionarioController from '../controllers/funcionario-controller'

const router = express.Router()
const funcionarioController = new FuncionarioController()

router.post('/cadastro/:id', funcionarioController.cadastrarFuncionarios)
router.post('/evento/:id', funcionarioController.adicionarEventoFuncionario)
router.post('/trabalho/:id', funcionarioController.adicionarDiaTrabalhado)
router.get('/empresa/:id', funcionarioController.getFuncionarios)
router.get('/:id', funcionarioController.getFuncionario)
router.put('/atualizar/:id', funcionarioController.atualizarFuncionario)
router.delete('/:id', funcionarioController.excluirFuncionario)

module.exports = router
