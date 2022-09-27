// import dayjs from 'dayjs'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// models
import SurveyModel from 'App/Models/Survey'
export default class UmovMeController {
  public async receiveStatusFromTask({request, response}: HttpContextContract){
    const {taskId} = request.body()
    if (!taskId) return response.status(500).json('taskId is mandatory, not found')

    const surveyViewData =
      await Database.from('view_surveys')
      .where('tarefa_servico_solicitado', taskId)
      .first()

    if (!surveyViewData) return response.status(404).json('task not found in survey')

    const surveyData = await SurveyModel.query().where('id', surveyViewData.id).where('finished_task', false).first()
    if (!surveyData) return response.status(404).json('survey not found')

    surveyData.finished_task = true
    surveyData.save()

    return response.status(200).json('Task successfully updated!')
  }
}
