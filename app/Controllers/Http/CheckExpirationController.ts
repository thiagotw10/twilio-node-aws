import dayjs from 'dayjs'

//Models
import MovementModel from 'App/Models/Movement'

//Utils
import TwilioResponse from 'App/Utils/TwilioResponse'

export default class CheckExpirationController {
  public async index(){
    const movementData =
      await MovementModel.query().where('active', true).whereNull('survey_id').preload('client')
    if (!movementData) return

    const message =
    `Ops! O tempo de resposta acabou 😞

    Vou encerrar nossa conversa por aqui. Mas não se preocupe.
    Caso queira solicitar um novo serviço, basta me chamar novamente. 😉`

    for (let iMovement = 0; iMovement < movementData.length; iMovement++) {

      const expirationTime = 10
      const movementDate = dayjs(movementData[iMovement].createdAt.toString())
      const nowDateWithAddMinutes = dayjs()
      const diffDates = nowDateWithAddMinutes.diff(movementDate) / 60000
      if (diffDates > expirationTime){ // init expiration process
        movementData[iMovement].active = false
        await movementData[iMovement].save()
        await new TwilioResponse().create({
          accountSid: movementData[iMovement].client.account_sid,
          authToken: movementData[iMovement].client.auth_token,
          from: movementData[iMovement].client.phone_number,
          to: movementData[iMovement].number,
          message
        })

      }

    }
    return true
  }
}
