//import { IXmlSingleRequest } from 'App/Controllers/Interfaces/IXml'
import Moment from 'moment';
import Day from 'dayjs'
import xml2js from 'xml2js'
import RequestOutController from 'App/Controllers/Http/RequestOutsController'
import ClientsController from 'App/Controllers/Http/ClientsController'
import Api from 'App/Services/Api'
import Log from 'App/Utils/logs'
import Database from '@ioc:Adonis/Lucid/Database'
import ApiService from 'App/Services/Api'

export default class XmlsController {
  public async BuildXmlSingleRequest(){

  //console.log('Iniciando Build XMl...')
  const dataRequest = await new RequestOutController().show()

  if (dataRequest != null){
    //console.log('Registro encontrado, Buildando Xml')

    const dataClient = await new ClientsController().show(dataRequest.movements.client_id)

    if (dataClient != null){

      const apiMv = await new Api().dataMv({
        url: dataClient.api_mv_url,
        nr_attendance: dataRequest.nr_attendance,
        token: dataClient.api_mv_token,
        company_id: dataClient.company_id,
      })

      if (apiMv != null){
        //console.log('ok')
        let content = JSON.parse(dataRequest.content)
        let alternativeIdentifier: string;

        switch (dataClient.alternative_identifier) {
          case 'SETOR-LEITO': alternativeIdentifier = `${apiMv.CD_SETOR}-${apiMv.CD_LEITO}`
          break;

          case 'UNID-LEITO': alternativeIdentifier = `${apiMv.CD_UNID_INT}-${apiMv.CD_LEITO}`
          break;

          default: alternativeIdentifier = apiMv.CD_SETOR_LEITO
          break;
        }

        content.schedule.serviceLocal.alternativeIdentifier = alternativeIdentifier
        content.schedule.customFields["pac.cd_paciente"] = apiMv.CD_PACIENTE
        content.schedule.customFields["pac.nm_paciente"] = apiMv.NM_PACIENTE
        content.schedule.customFields["pac.sn_vip"] = apiMv.SN_VIP
        content.schedule.customFields["con.cd_convenio"] = apiMv.CD_CONVENIO
        content.schedule.customFields["con.nm_convenio"] = apiMv.NM_CONVENIO
        content.schedule.customFields["pac.cd_atendimento"] = apiMv.CD_ATENDIMENTO
        content.schedule.customFields["pac.dt_nascimento"] = Moment(apiMv.DT_NASCIMENTO).format('D/M/Y')

        let dataUpdate = await new RequestOutController().update({
          id: dataRequest.id,
          content: await this.jsonToXml(content)
        })

        if (dataUpdate){



          return true
        }else{
          return false
        }

      }else{
        return false
      }
    }

    return false

  }else{
    //console.log('Nenhum Registro encontrado, para Xml')
  }

  return false

  }

  public async BuildXmlSingleRequestItens(){
    //console.log('Iniciando Build XMl Itens...')

    const dataRequest = await new RequestOutController().showItens()

    if (dataRequest != null){

      const dataClient = await new ClientsController().show(dataRequest.movements.client_id)

      if (dataClient != null){

        const apiMv = await new Api().dataMv({
          url: dataClient.api_mv_url,
          nr_attendance: dataRequest.nr_attendance,
          token: dataClient.api_mv_token,
          company_id: dataClient.company_id,
        })

        if (apiMv != null){

          let content = JSON.parse(dataRequest.content)

          let dataUpdate = await new RequestOutController().update({
            id: dataRequest.id,
            content: await this.jsonToXml(content)
          })

          if (dataUpdate){
            return true
          }else{
            return false
          }

        }else{
          return false
        }
      }

      return false

    }else{
      //console.log('Nenhum Registro encontrado, para Xml itens')
    }

    return false

  }

  public async BuildXmlSurvey(data: {
    content: any, api_mv_url: string, api_mv_token: string, nr_attendance: string, company_id: number, alternativeIdentifier: string
  }){

    Log.info(`Build XML -> Data: ${JSON.stringify(data)}`)

        const apiMv = await new Api().dataMv({
          url: data.api_mv_url,
          nr_attendance: data.nr_attendance,
          token: data.api_mv_token,
          company_id: data.company_id,
        })

        Log.info(`Build XML: Retorno api, ${JSON.stringify(apiMv)}`)

        if (apiMv != null){
          let alternativeIdentifier: string;
          switch (data.alternativeIdentifier) {
            case 'SETOR-LEITO': alternativeIdentifier = `${apiMv.CD_SETOR}-${apiMv.CD_LEITO}`
            break;

            case 'UNID-LEITO': alternativeIdentifier = `${apiMv.CD_UNID_INT}-${apiMv.CD_LEITO}`
            break;

            default: alternativeIdentifier = `${apiMv.CD_SETOR}-${apiMv.CD_LEITO}`
            break;
          }

          data.content.schedule.serviceLocal.alternativeIdentifier = alternativeIdentifier
          data.content.schedule.customFields["pac.cd_paciente"] = apiMv.CD_PACIENTE
          data.content.schedule.customFields["pac.nm_paciente"] = apiMv.NM_PACIENTE
          data.content.schedule.customFields["pac.sn_vip"] = apiMv.SN_VIP
          data.content.schedule.customFields["con.cd_convenio"] = apiMv.CD_CONVENIO
          data.content.schedule.customFields["con.nm_convenio"] = apiMv.NM_CONVENIO
          data.content.schedule.customFields["pac.cd_atendimento"] = apiMv.CD_ATENDIMENTO
          data.content.schedule.customFields["pac.dt_nascimento"] = Moment(apiMv.DT_NASCIMENTO).format('D/M/Y')

          return await this.jsonToXml(data.content)

        }else{
          Log.error(`XmlsController -> Build XML Survey: error`)
          return false
        }
  }

  public async send(){ // envia o single Xml e builda os itens, depois envia tudo

    const dataRequest = await new RequestOutController().showSend()

    if (dataRequest){
      const dataClient = await new ClientsController().show(dataRequest.movements.client_id)

      if (!dataClient || dataClient.active_send_request == false){
        //console.log(`Desativado envio de xml, cliente: ${dataClient?.description}...`)
        return false
      }

      let endpoint = dataRequest.type_request_id == 1 ? dataClient.endpoint_request : dataClient.endpoint_request_itens

      const sendXmlSingleRequest = await new Api().sendXmlTo3Wings({
        url: endpoint,
        xml: dataRequest.content
      })



      if (sendXmlSingleRequest && dataRequest.type_request_id == 1){

        await new RequestOutController().update({
          id: dataRequest.id,
          return_content: sendXmlSingleRequest
        })

        let retSingleRequest = sendXmlSingleRequest

        const reqOut = await new RequestOutController().storeItens({
          client_id: dataClient.id,
          main_movement: dataRequest.movement_id,
          nr_attendance: dataRequest.nr_attendance,
          number: dataRequest.number,
          requestOUtId: dataRequest.id,
          task: retSingleRequest,
          type_request_id: 2
        })

        return reqOut ? true : false

      }else if(sendXmlSingleRequest && dataRequest.type_request_id == 2){

        await new RequestOutController().update({
          id: dataRequest.id,
          return_content: sendXmlSingleRequest
        })

        return true
      }

      if (!sendXmlSingleRequest){
        await new RequestOutController().update({
          id: dataRequest.id,
          return_content: 'error'
        })
      }

    }

    return false
  }

  public async BuildXmlSurveyCustom(data: { survey_id: number, url: string}){

    try {
      const dataViewSurvey: {
        status_resposta: string,
        nota: string,
        comentario: string,
        tarefa_pesquisa: string,
        dt_contato_pesquisa: string,
        dt_final_pesquisa: string,
        tarefa_servico_solicitado: string,
        servico_solicitado: string,
        dt_solicitacao: string,
      } =
        await Database.from('view_surveys').select('*').where('id', data.survey_id).first()

      let contentJsonItens = {
        customEntityEntry: {
          description: data.survey_id,
          alternativeIdentifier: `${data.survey_id}-${dataViewSurvey.tarefa_servico_solicitado}`,
          customFields: {
            status_resposta: dataViewSurvey.status_resposta,
            nota: dataViewSurvey.nota,
            comentario: dataViewSurvey.comentario,
            tarefa_pesquisa: dataViewSurvey.tarefa_pesquisa,
            dt_contato_pesquisa: Day(dataViewSurvey.dt_contato_pesquisa).format('DD/MM/YYYY HH:mm:ss'),
            dt_final_pesquisa: Day(dataViewSurvey.dt_final_pesquisa).format('DD/MM/YYYY HH:mm:ss'),
            tarefa_servico_solicitado: dataViewSurvey.tarefa_servico_solicitado,
            servico_solicitado: dataViewSurvey.servico_solicitado,
            dt_solicitacao: Day(dataViewSurvey.dt_solicitacao).format('DD/MM/YYYY HH:mm:ss'),
          }
        }
      }

      Log.info(`xml custom, contentJsonItens: ${JSON.stringify(contentJsonItens)}`)

      const builder = new xml2js.Builder()
      const xml = builder.buildObject(contentJsonItens)
      Log.info(`xml custom, survey: ${xml}, url: ${data.url}`)

      const rSendXml = await new ApiService().sendXmlTo3Wings({
        url: data.url,
        xml
      })
      if (!rSendXml) {
        Log.error(`Send xml survey end error, url: ${data.url}, xml: ${xml}`)
        return false
      }

      return true
    } catch (error) {
      Log.error(`Send xml survey end error, error: ${error}`)
    }

  }

  public async jsonToXml(content: string){
    const builder = new xml2js.Builder()
    return builder.buildObject(content)
  }
}
