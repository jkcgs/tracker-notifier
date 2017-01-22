const path = require('path');
const fs = require('fs');

module.exports = {
    get: get,
    exists: exists
};

function get(provider) {
    if(typeof provider === 'undefined' || !provider) {
        let trackersDir = path.join(__dirname, 'trackers');
        let files = fs.readdirSync(trackersDir)
            .filter((file) => file.endsWith('.js'))
            .map((e) => e.substr(0, e.length-3));
        
        return files;
    }
    
    return exists(provider) ? require('./trackers/' + provider) : null;
}

function exists(provider) {
    return get().indexOf(provider) > -1;
}