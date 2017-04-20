const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const base = require('../tracker-base');
const debug = require('debug')('tracker-notifier:dhl');
module.exports = DHL;

function DHL() {
    this.name = 'DHL Express';
    this.getStatus = getStatus;
    let url = 'http://www.dhl.com/shipmentTracking?AWB=';

    function getStatus(code) {
        let urld = url + encodeURIComponent(code);
        return request(urld).then(function(data) {
            data = JSON.parse(data);
            let statuses = data.results[0].checkpoints;
            let status = statuses[0];

            for(let i = 0; i < statuses.length; i++) {

                if(statuses[i].counter > status.counter) {
                    status = statuses[i];
                }
            }

            // "ednesday, April 19, 2017 17:13
            let d = moment(status.date + status.time, 'dddd, MMMM DD, YYYY HH:mm');

            return {
                code: code,
                status: status.description,
                date: d.toDate(),
                location: status.location,
                delivered: false,
                deliveryInfo: {}
            };
        });
    }
}