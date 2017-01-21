module.exports = { run: run };

const debug = require('debug')('tracker-notifier:loop');
const fs = require('fs');
const path = require('path');
const Queue = require('promise-queue');
let Item = require('./models/item');
let queue = new Queue(1, Infinity);
let providerCache = {};
let emptyMsg = true;
let lastEmpty = false;

function getProvider(provider) {
    if(providerCache.hasOwnProperty(provider)) {
        //debug('Tracker ' + provider + ' loaded from cache');
        return providerCache[provider];
    }

    let trackersDir = path.join(__dirname, 'trackers');
    let files = fs.readdirSync(trackersDir).filter((file) => file.endsWith('.js'));
    if(files.indexOf(provider + '.js') === -1) {
        return null;
    }

    //debug('Loading tracker provider ' + provider);
    let Provider = require('./trackers/' + provider);
    providerCache[provider] = new Provider();
    return providerCache[provider];
}

function run() {
    if(!lastEmpty) {
        debug('Running tracker for items...');
    }

    Item.find((err, items) => {
        if(err) {
            debug('Error happened when loading items from database!');
            throw err;
        }

        if(items.length === 0) {
            if(emptyMsg) {
                debug('No codes were found at the moment!');
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
            let provider = getProvider(item.provider);
            if(provider === null) {
                debug('Invalid provider ' + item.provider + ' for item code ' + item.code);
                if(queue.getPendingLength() === 0) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }

                return;
            }

            queue.add(function(){ 
                return provider.getStatus(item.code);
            }).then((info) => {
                debug(info);

                if(++j === items.length) {
                    debug('Done! Waiting 15 seconds to restart...');
                    setTimeout(run, 15000);
                }
            }).catch((reason) => {
                debug(reason);
            });
        });
    });
}