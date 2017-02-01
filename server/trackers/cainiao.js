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
    let url = 'https://global.cainiao.com/detail.htm';

    function getStatus(code) {
        return new Promise((resolve, reject) => {
            let opts = {
                uri: url,
                qs: {
                    mailNoList: code
                }
            };

            request.get(opts, (err, res, data) => {
                if(err !== null) {
                    return reject(err);
                }

                if(!data) {
                    return reject('No se recibieron datos');
                }

                let cont = JSON.parse(cheerio.load(data)('#waybill_list_val_box').text()).data;
                if (!cont) {
                    return reject('Error en la API: No entregó datos correctos');
                }

                cont = (Array.isArray(cont) ? cont[0] : cont.data[0]);
                if(!cont.success) {
                    return reject(new Error('Error en la API: ' + cont.errorCode));
                }

                let status = cont.latestTrackingInfo;
                if(!status) {
                    return reject(new Error('Error en la API: no se entregó el estado del item'));
                }

                let date = parseDate(status.time);

                resolve({
                    code: code,
                    status: status.desc,
                    date: date,
                    location: 'No entregada',
                    delivered: cont.status === 'SIGNIN',
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