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
    let url = 'https://track24.net/ajax/tracking.ajax.php';

    function getStatus(code) {
        return new Promise((resolve, reject) => {
            let opts = {
                uri: url,
                form: {
                    selectedService: 'cainiao',
                    code: code
                }
            };

            request.post(opts, (err, res, data) => {
                if(err !== null) {
                    return reject(err);
                }

                if(!data) {
                    return reject('No se recibieron datos');
                }

                let cont = JSON.parse(data);

                if(cont.status === 'error') {
                    reject(new Error('Error en la API: ' + cont.message));
                }

                let status = cont.data.events;
                status = status[status.length-1];
                let date = parseDate(status.operationDateTime);
                debug(status.operationAttribute);
                resolve({
                    code: code,
                    status: status.operationAttribute,
                    date: date,
                    location: 'No entregada',
                    delivered: status.operationAttribute.indexOf('Delivered') > -1,
                    deliveryInfo: {}
                });
            });
        });
    }
}

function parseDate(dateStr) {
    let two = dateStr.split(' ');
    let date = two[0];
    let time = two[1];
    let dateEls = date.split('.');
    let hourEls = time.split(':');

    let parsed = new Date(
        Date.UTC(dateEls[0], parseInt(dateEls[1])-1, dateEls[2], hourEls[0], hourEls[1], hourEls[2])
    );

    // agregar 3 horas para mover a UTC
    parsed.setTime(parsed.getTime()+(60*60*3));

    return parsed;
}