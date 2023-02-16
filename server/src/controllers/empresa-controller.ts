import { Request, Response, Router } from "express"
import { PrismaClient } from "@prisma/client"
import { z } from 'zod'
import dayjs from "dayjs"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

type Funcionario = {
  nomeFuncionario: string
  sobrenomeFuncinoario : string
  posicaoFuncionario: string,
  turnoFuncionario: string,
  horaInicio: Date
  horaFinal: Date
}

class EmpresaController {
  public router: Router = Router()
  public prisma = new PrismaClient()
  private SECRET_MESSAGE: string = 'a-super-super-super-long-secret-message'

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get('/', this.getEmpresas)
    this.router.get('/:id', this.getEmpresa)
    this.router.post('/cadastro', this.cadastrarEmpresa)
    this.router.post('/entrar', this.logarEmpresa)
  }

  getEmpresa = async (req: Request, res: Response) => {
    await this.prisma.$connect()
    const id: string = req.params?.id

    try {
      const empresa = await this.prisma.empresa.findUnique({
        where: {
          id: id
        }
      })

      const funcionarios = await this.prisma.funcionario.findMany({
        where: {
          empresaId: id
        }
      })
      res.status(200).json({ empresa: empresa, funcionarios: funcionarios })
      await this.prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await this.prisma.$disconnect()
    }
  }

  getEmpresas = async (req: Request, res: Response) => {
    await this.prisma.$connect()

    try {
      const empresas = await this.prisma.empresa.findMany()
      res.status(200).json(empresas)
      await this.prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await this.prisma.$disconnect()
    }
  }

  public atualizarEmpresa = async (funcionario: Funcionario, empresaId: string) => {
    await this.prisma.$connect()

    const updateEmpresa = await this.prisma.empresa.update({
      where: {
        id: empresaId,
      }, 
      data: {
        funcionarios: {
          create: {
            nomeFuncionario: funcionario.nomeFuncionario,
            sobrenomeFuncionario: funcionario.sobrenomeFuncinoario,
            posicaoFuncionario: funcionario.posicaoFuncionario,
            turnoFuncionario: funcionario.turnoFuncionario,
            horaInicio: funcionario.horaInicio,
            horaFinal: funcionario.horaFinal,
          }
        }
      }
    })

    await this.prisma.$disconnect()
    return updateEmpresa
  }

  cadastrarEmpresa = async (req: Request, res: Response) => {
    await this.prisma.$connect()
    const createEmpresaBody = z.object({
      nomeFantasia: z.string(),
      email: z.string(),
      senha: z.string(),
      qtdFuncionarios: z.number(),
    })
    
    let {
      nomeFantasia,
      email,
      senha,
      qtdFuncionarios,
    } = createEmpresaBody.parse(req.body)

    const today = dayjs().startOf('day').toDate()

    try {
      let newEmpresa = await this.prisma.empresa.findUnique({
        where: {
          email: email,
        }
      })

      if (!newEmpresa) {
        const salt = await bcrypt.genSalt(10)
        senha = await bcrypt.hash(senha, salt)
        await this.prisma.empresa.create({
          data: {
            nomeFantasia: nomeFantasia,
            email: email,
            senha: senha,
            qtdFuncionarios: qtdFuncionarios,
          }
        })
        res.status(200).json({ message: 'Empresa cadastrada com sucesso!' })
      } else {
        res.status(400).json({ message: 'Empresa já cadastrada!' })
      }
      await this.prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await this.prisma.$disconnect()
    }
  }

  logarEmpresa = async (req: Request, res: Response) => {
    await this.prisma.$connect()

    try {
      const email = req.body.email
      const empresa = await this.prisma.empresa.findUnique({
        where: {
          email: email
        }
      })
  
      if (empresa) {
        const senhaValida = await bcrypt.compare(req.body.senha, empresa.senha)
  
        if (!senhaValida) {
          res.status(401).json({ message: 'Senha inválida!' })
        } else {
          const token = jwt.sign(
            {
              nomeFantasia: empresa.nomeFantasia,
              email: empresa.email,
              empresaId: empresa.id
            },
            this.SECRET_MESSAGE,
            {
              expiresIn: '1h'
            },
          )
          return res.status(200).json({
            token: token,
            empresaId: empresa.id,
            expiresIn: 3600,
            nomeFantasia: empresa.nomeFantasia,
          })
        }
      } else {
        res.status(401).json({ message: 'E-mail inválido!' })
      }  
    } catch (error) {
      res.status(500).json({ message: 'Ocorreu um erro!' }) 
    }
  }
}

export default EmpresaController
