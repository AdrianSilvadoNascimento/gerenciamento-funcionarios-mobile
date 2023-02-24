import { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import EmpresaController from './empresa-controller'

type Funcionario = {
  nomeFuncionario: string
  sobrenomeFuncionario : string
  cargoFuncionario: string,
  turnoFuncionario: string,
  horaInicio: Date
  horaFinal: Date
}

class FuncionarioController {
  public router: Router = Router()
  public empresaController: EmpresaController = new EmpresaController()
  
  constructor() {
    this.initializeRoutes()    
  }

  private initializeRoutes() {
    this.router.post('/cadastro/:id', this.cadastrarFuncionarios)
    this.router.post('/trabalho/:id', this.adicionarDiaTrabalhado)
    this.router.post('/evento/:id', this.adicionarEventoFuncionario)
    this.router.get('/empresa/:id', this.getFuncionarios)
    this.router.get('/:id', this.getFuncionario)
    this.router.put('/atualizar/:id', this.atualizarFuncionario)
    this.router.delete('/:id', this.excluirFuncionario)
  }

  getFuncionario = async (req: Request, res: Response) => {
    try {
      await prisma.$connect()

      const funcionarioId: string = req.params?.id

      const funcionario = await prisma.funcionario.findUnique({
        where: {
          id: funcionarioId,
        }
      })

      
      if (funcionario) {
        const eventos = await prisma.eventoFuncionario.findMany({
          where: {
            funcionarioId: funcionarioId
          }
        })
  
        const diasTrabalhados = await prisma.diaTrabalhado.findMany({
          where: {
            funcionarioId: funcionarioId
          }
        })

        res.status(200).json({funcionario, eventos, diasTrabalhados})
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
    try {
      await prisma.$connect()

      const empresaId: string = req.body.empresaId

      const funcionarios = await prisma.funcionario.findMany({
        where: {
          id: empresaId,
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
    try {
      await prisma.$connect()

      const data = req.body
      const empresaId: string = req.params?.id

      const getDayParam = z.object({
        horaInicio: z.coerce.date(),
        horaFinal: z.coerce.date(),
      })

      const { horaInicio, horaFinal } = getDayParam.parse(data)
      const funcionario: Funcionario = {
        nomeFuncionario: data.nomeFuncionario,
        sobrenomeFuncionario: data.sobrenomeFuncionario,
        cargoFuncionario: data.cargoFuncionario,
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

  atualizarFuncionario = async (req: Request, res: Response) => {
    try {
      await prisma.$connect()

      const data = req.body
      const funcionarioId: string = req.params?.id
      const getDayParam = z.object({
        horaInicio: z.coerce.date(),
        horaFinal: z.coerce.date(),
      })

      const { horaInicio, horaFinal } = getDayParam.parse(data)

      let funcionario = await prisma.funcionario.findUnique({
        where: {
          id: funcionarioId,
        }
      })

      if (funcionario) {
        funcionario = await prisma.funcionario.update({
         where: {
           id: funcionarioId,
         },
         data: {
           nomeFuncionario: data.nomeFuncionario,
           sobrenomeFuncionario: data.sobrenomeFuncionario,
           cargoFuncionario: data.cargoFuncionario,
           turnoFuncionario: data.turnoFuncionario,
           horaInicio: horaInicio,
           horaFinal: horaFinal,
         }
       })
       res.status(200).json({ message: 'Funcionário atualizado com sucesso!' })
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

  adicionarDiaTrabalhado = async (req: Request, res: Response) => {
    try {
      await prisma.$connect()

      const funcionarioId: string = req.params?.id
      const data = req.body
      const getDayParam = z.object({
        horaInicio: z.coerce.date(),
        horaFinal: z.coerce.date(),
      })

      const { horaInicio, horaFinal } = getDayParam.parse(data)

      const horasTrabalhadas = 
        (horaFinal.getHours() - horaInicio.getHours()) + 
        (horaFinal.getMinutes() - horaInicio.getMinutes())

      const funcionario = await prisma.funcionario.findUnique({
        where: {
          id: funcionarioId,
        }
      })

      const dias = await prisma.diaTrabalhado.findMany({
        where: {
          funcionarioId: funcionarioId
        }
      })

      let canSave: boolean = false

      if (dias) {
        canSave = !dias.some(diaTrabalhado => diaTrabalhado.dia.getDate() === new Date().getDate())
      }

      if (!funcionario) {
        res.status(404).json({ message: 'Funcionário não encontrado!' })
      } else {
        if (canSave) {
          await prisma.diaTrabalhado.create({
            data: {
              dia: new Date(),
              funcionarioId: funcionarioId,
              horasNoDia: horasTrabalhadas,
            }
          })
  
          res.status(200).json({ message: 'Horas adicionadas com sucesso!' })
        } else {
          return res.status(401).json({ message: 'Horas já adicionada!' })
        }
      }
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  adicionarEventoFuncionario = async (req: Request, res: Response) => {
    try {
      await prisma.$connect()

      const funcionarioId: string = req.params?.id
      const data = req.body

      const funcionario = await prisma.funcionario.findUnique({
        where: {
          id: funcionarioId,
        }
      })

      if (!funcionario) {
        res.status(404).json({ message: 'Funcionário não encontrado!' })
      } else {
        await prisma.eventoFuncionario.create({
          data: {
            funcionarioId: funcionarioId,
            key: data.evento,
            dataInicio: data.dataInicio,
            dataFinal: data.dataFina,
            comecoDia: data.comecoDia,
            finalDia: data.finalDia,
            selecionado: data.selecionado,
          }
        })
        res.status(200).json({ message: 'Evento adicionado com sucesso!' })
      }

      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  excluirFuncionario = async (req: Request, res: Response) => {
    try {
      await prisma.$connect()

      const funcionarioId: string = req.params?.id

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

        await prisma.diaTrabalhado.deleteMany({
          where: {
            funcionarioId: funcionarioId
          }
        })

        await prisma.eventoFuncionario.deleteMany({
          where: {
            funcionarioId: funcionarioId
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
