const request = require('request-promise-native');
//const cheerio = require('cheerio');
//const moment = require('moment');
const base = require('../tracker-base');
const debug = require('debug')('tracker-notifier:chinapost');
module.exports = ChinaPost;

// TODO: Stub
function ChinaPost() {
    this.name = 'ChinaPost';
    this.getStatus = getStatus;
    let url = 'http://track-chinapost.com/result_china.php';

    function getStatus(code) {
        return request.post(url, {form:{'order_no':code}}).then(function(data) {
            if(data.indexOf('is invalid') > -1 || data.indexOf('server is busy') > -1) {
                throw new Error(base.errors.notExists);
            }

            return {
                code: code,
                status: 'Unknown',
                date: new Date(0),
                location: 'Unknown',
                delivered: false,
                deliveryInfo: {}
            };
        });
    }
}