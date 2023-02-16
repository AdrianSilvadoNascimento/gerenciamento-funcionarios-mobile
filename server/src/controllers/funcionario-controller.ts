import { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import EmpresaController from './empresa-controller'

type Funcionario = {
  nomeFuncionario: string
  sobrenomeFuncinoario : string
  posicaoFuncionario: string,
  turnoFuncionario: string,
  horaInicio: Date
  horaFinal: Date
}

class FuncionarioController {
  public path: string = '/cadastro/:id'
  public router: Router = Router()
  public empresaController = new EmpresaController()
  
  constructor() {
    this.initializeRoutes()    
  }

  private initializeRoutes() {
    this.router.get('/:id', this.getFuncionarios)
    this.router.get('/:id', this.getFuncionario)
    this.router.post(this.path, this.cadastrarFuncionarios)
    this.router.delete('/:id', this.excluirFuncionario)
  }

  getFuncionario = async (req: Request, res: Response) => {
    await prisma.$connect()

    try {
      const id: string = req.params?.id

      const funcionario = await prisma.funcionario.findUnique({
        where: {
          id: id
        }
      })

      if (funcionario) {
        const empresa = await prisma.empresa.findUnique({
          where: {
            id: funcionario?.empresaId
          }
        })
        res.status(200).json({ empresa: empresa, funcionario: funcionario })
      } else {
        res.status(404).json({ message: 'Funcionário não encontrado!' })
      }
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  getFuncionarios = async (req: Request, res: Response) => {
    await prisma.$connect()

    try {
      const empresaId = req.body.empresaId

      const funcionarios = await prisma.funcionario.findMany({
        where: {
          id: empresaId
        }
      })
      res.status(200).json(funcionarios)
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  cadastrarFuncionarios = async (req: Request, res: Response) => {
    await prisma.$connect()

    try {
      const data = req.body
      const empresaId = req.params?.id

      const getDayParam = z.object({
        horaInicio: z.coerce.date(),
        horaFinal: z.coerce.date(),
      })

      const { horaInicio, horaFinal } = getDayParam.parse(data)
      const funcionario: Funcionario = {
        nomeFuncionario: data.nomeFuncionario,
        sobrenomeFuncinoario: data.sobrenomeFuncinoario,
        posicaoFuncionario: data.posicaoFuncionario,
        turnoFuncionario: data.turnoFuncionario,
        horaInicio: horaInicio,
        horaFinal: horaFinal,
      }

      await this.empresaController.atualizarEmpresa(funcionario, empresaId)
      res.status(200).json({ message: 'Funcionário adicionado com sucesso!' })
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  excluirFuncionario = async (req: Request, res: Response) => {
    await prisma.$connect()

    try {
      const funcionarioId = req.params?.id

      const funcionarioDeletado = await prisma.funcionario.findUnique({
        where: {
          id: funcionarioId
        }
      })

      if (funcionarioDeletado) {
        await prisma.funcionario.delete({
          where: {
            id: funcionarioId
          }
        })
  
        res.status(200).json({ 
          message: `Funcionario: ${funcionarioDeletado?.nomeFuncionario} foi excluído com sucesso!`,
        })
      } else {
        res.status(404).json({ message: 'Funcionário não encontrado!' })
      }
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }
}

export default FuncionarioController
