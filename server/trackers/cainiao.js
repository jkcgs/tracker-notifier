const request = require('request');
const cheerio = require('cheerio');
const base = require('../tracker-base');
const debug = require('debug')('tracker-notifier:cainiao');
module.exports = CainiaoGlobal;

/**
 * Retorna el estado de un envío. 
 * TODO: Retornar objeto estandarizado con el estado
 */

function CainiaoGlobal() {
    this.name = 'Cainiao Global/AliEx Standard';
    this.getStatus = getStatus;
    let url = 'https://www.trackingmore.com/gettracedetail.php';

    function getStatus(code) {
        return new Promise((resolve, reject) => {
            let opts = {
                uri: url,
                qs: {
                    express: 'cainiao',
                    tracknumber: code
                }
            };

            request.get(opts, (err, res, data) => {
                if(err !== null) {
                    return reject(err);
                }

                if(!data) {
                    return reject('No se recibieron datos');
                }

                let cont = JSON.parse(data.substr(1, data.length-2));

                if(cont.status === 'error') {
                    return reject(new Error('Error en la API: ' + cont.message));
                }

                let status = cont.originCountryData.trackinfo[0];
                if(!status) {
                    return reject(new Error('Error en la API: no se entregó el estado del item'));
                }

                let date = parseDate(status.Date);

                resolve({
                    code: code,
                    status: status.StatusDescription,
                    date: date,
                    location: 'No entregada',
                    delivered: cont.originCountryData.statusDataNum === 4,
                    deliveryInfo: {}
                });
            });
        });
    }
}

// 2017-01-26 00:45:35
function parseDate(dateStr) {
    let two = dateStr.split(' ');
    let date = two[0];
    let time = two[1];
    let dateEls = date.split('-');
    let hourEls = time.split(':');

    let parsed = new Date(
        Date.UTC(dateEls[0], parseInt(dateEls[1])-1, dateEls[2], hourEls[0], hourEls[1], hourEls[2])
    );

    // agregar 3 horas para mover a UTC
    parsed.setTime(parsed.getTime()+(60*60*3));

    return parsed;
}