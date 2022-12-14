import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

//models
import LogAccess from 'App/Models/LogAccess'

export default class LogAccessesController {
  public async index (data: { number: string }) {
    return await LogAccess
    .query()
    .where('number', data.number)
    .orderBy(`id`, `desc`)
    .first()
  }

  public async create ({}: HttpContextContract) {
  }

  public async store (data: {
    number: string,
    received : string,
    send: string,
  }){
    let retData = await LogAccess.create(data)
    return retData ? true : false
  }

  public async show ({}: HttpContextContract) {
  }

  public async edit ({}: HttpContextContract) {
  }

  public async update ({}: HttpContextContract) {
  }

  public async destroy ({}: HttpContextContract) {
  }
}
