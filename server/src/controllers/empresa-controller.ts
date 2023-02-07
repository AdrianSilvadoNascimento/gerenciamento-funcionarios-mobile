import { Request, Response, Router } from "express"
import { prisma } from '../lib/prisma'
import { z } from 'zod'

class EmpresaController {
  public path: string = '/cadastro'
  public router: Router = Router()

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get('/', this.getEmpresas)
    this.router.get('/:id', this.getEmpresa)
    this.router.post(this.path, this.cadastrarEmpresa)
  }

  getEmpresa = async (req: Request, res: Response) => {
    await prisma.$connect()
    const id: string = req.params?.id

    try {
      const empresa = await prisma.empresa.findUnique({
        where: {
          id: id
        }
      })

      const funcionarios = await prisma.funcionario.findMany({
        where: {
          empresaId: id
        }
      })
      res.status(200).json({ empresa: empresa, funcionarios: funcionarios })
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  getEmpresas = async (req: Request, res: Response) => {
    await prisma.$connect()

    try {
      const empresas = await prisma.empresa.findMany()
      res.status(200).json(empresas)
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }

  cadastrarEmpresa = async (req: Request, res: Response) => {
    await prisma.$connect()
    const createEmpresaBody = z.object({
      nomeFantasia: z.string(),
      email: z.string(),
      senha: z.string(),
      qtdFuncionarios: z.number(),
    })
    
    const {
      nomeFantasia,
      email,
      senha,
      qtdFuncionarios,
    } = createEmpresaBody.parse(req.body)

    try {
      const empresa = await prisma.empresa.findUnique({
        where: {
          email: email
        }
      })

      if (!empresa) {
        await prisma.empresa.create({
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
      await prisma.$disconnect()
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Ocorreu um erro!' })
      await prisma.$disconnect()
    }
  }
}

export default EmpresaController
