export default class Icons {
    async default(data: any) {
      let ico = '';
      switch (data){
        case 'hotelaria': ico = '๐๏ธ'
        break

        case 'lavanderia': ico = '๐งน'
        break

        default: ico = ''
      }

      return ico;
    }
}

module.exports = Icons
