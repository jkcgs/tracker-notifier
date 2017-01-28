const path = require('path');
const fs = require('fs');

module.exports = {
    get: get,
    exists: exists,
    getList: getList
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

function getList() {
    let files = get();
    let trackersDir = path.join(__dirname, 'trackers');
    let list = [];

    files.forEach((file) => {
        let T = require(path.join(trackersDir, file + '.js'));

        list.push({
            id: file,
            name: (new T()).name
        });
    });

    return list;
}

function exists(provider) {
    return get().indexOf(provider) > -1;
}