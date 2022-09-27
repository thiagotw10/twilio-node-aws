import Axios from 'axios'
import { parseString } from 'xml2js'
import Log from 'App/Utils/logs'
export default class umovMe {
  // consults tasks with status: end
  async searchTaskWithStatusEnd(data: { taskId: string, url_base: string }) {
  try {
    let returnXML: any = `0`;
    const url = data.url_base.replace(`.xml`, `/${data.taskId}.xml`)
    const ret = await Axios({
        method: 'GET',
        url,
        data: null,
      }
    ).then(function (response: any) {

      return response.data
    })

    parseString(`<?xml version="1.0" encoding="UTF-8"?>${ret}`,
    (err, result) => {
      if (err) return
      returnXML = result.schedule.situation[0].id
      return;
    })

    Log.info(`init survey return xml task end: ${returnXML}`)
    return returnXML == 50 ? true : false;
    //return returnXML == 50 ? false : true;
  } catch (error) {
    Log.error(`error in search umovMe status: ${JSON.stringify(error)}`)
  }
  }

}


