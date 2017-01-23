module.exports = { run: run };

const debug = require('debug')('tracker-notifier:loop');
const fs = require('fs');
const path = require('path');
const Queue = require('promise-queue');
const providers = require('./providers');
const simplepush = require('./simplepush');
const trackerBase = require('./tracker-base');
let Item = require('./models/item');
let queue = new Queue(1, Infinity);
let providerCache = {};
let emptyMsg = true;
let lastEmpty = false;

function getProvider(provider) {
    if(providerCache.hasOwnProperty(provider)) {
        return providerCache[provider];
    }

    let Provider = providers.get(provider);
    if(Provider) {
        providerCache[provider] = new Provider();
        return providerCache[provider];
    } else {
        return null;
    }
}

function run() {
    if(!lastEmpty) {
        debug('Running tracker for items...');
    }

    Item.find({delivered: false}, (err, items) => {
        if(err) {
            debug('Error happened when loading items from database!');
            throw err;
        }

        if(items.length === 0) {
            if(emptyMsg) {
                debug('No active codes were found at the moment!');
                emptyMsg = false;
                lastEmpty = true;
            }

            setTimeout(run, 300);
            return;
        } else {
            debug('Codes loaded: ' + items.length);
            lastEmpty = false;
        }

        let j = 0;
        items.forEach((item) => {
            if(item.delivered) {
                //debug(item.code + ' skipped, delivered');
                if(++j === items.length) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }

                return;
            }

            let provider = getProvider(item.provider);
            if(provider === null) {
                debug('Invalid provider ' + item.provider + ' for item code ' + item.code);
                if(++j === items.length) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }

                return;
            }

            queue.add(function(){ 
                return provider.getStatus(item.code);
            }).then((info) => {
                if((item.lastUpdate.getTime() !== info.date.getTime())) {
                    simplepush.sendToUser(item.user, info.status, 'Actualización envío ' + item.code);
                }

                item.update({$set: { 
                    currentStatus: info.status, lastUpdate: info.date, delivered: info.delivered 
                }}, (err) => { });

                io.to(item.user).emit('status', {item: item, info: info});

                if(++j === items.length) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }
            }).catch((reason) => {
                if(++j === items.length) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }
            });
        });
    });
}