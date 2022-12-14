import twilio, { twiml } from "twilio"
import Message from 'App/Utils/Messages'
import Log from 'App/Utils/logs'
import {IMessage, ICreateMessage} from 'App/Controllers/Interfaces/IMessages'
import LogAccess from 'App/Controllers/Http/LogAccessesController'

export default class TwilioResponse {
  async send(data: IMessage) {

    const retMessage = await new Message().default(data)

    const objTwiml = new twiml.MessagingResponse()

    // log das conversas
    if (data.cd_message != `option_invalid`){
      await new LogAccess().store({
        number: data.from,
        received: data.body,
        send: retMessage.toString()
      })
    }
    // fim log das conversas

    return objTwiml.message(retMessage).toString()
  }

  async create(data: ICreateMessage) {
    const accountSid = data.accountSid;
    const authToken = data.authToken;
    const clientTwilio = twilio(accountSid, authToken);
    try {
      Log.info(`send message from twilio, From: ${data.from}, To: ${data.to}`)
      await clientTwilio.messages.create({
        body: data.message,
        from: `whatsapp:${data.from}`,
        to: `whatsapp:+55${data.to}`,
      });

      return true;
    } catch (error) {
      console.log(error)
      return false;
    }
  }
}

module.exports = TwilioResponse
