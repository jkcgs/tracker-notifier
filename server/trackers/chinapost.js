const request = require('request-promise-native');
const cheerio = require('cheerio');
const moment = require('moment');
const base = require('../tracker-base');
const debug = require('debug')('tracker-notifier:chinapost');
module.exports = ChinaPost;

function ChinaPost() {
    this.name = 'ChinaPost';
    this.getStatus = getStatus;
    let url = 'http://track-chinapost.com/result_china.php';

    function getStatus(code) {
        return request.post(url, {form:{'order_no':code}}).then(function(data) {
            if(data.indexOf('is invalid') > -1 || data.indexOf('server is busy') > -1) {
                throw new Error(base.errors.notExists);
            }

            let $ = cheerio.load(data);
            let table = $('table').eq(2);
            let statuses = table.find('tr').eq(0);

            let time = statuses.eq(0).find('td').eq(0).text();
            let status = statuses.eq(0).find('td').eq(1).text();
            let ptime = moment(time, 'YYYY-MM-DD HH:mm:ss.0');

            return {
                code: code,
                status: status,
                date: ptime.toDate(),
                location: 'Unknown',
                delivered: false,
                deliveryInfo: {}
            };
        });
    }
}