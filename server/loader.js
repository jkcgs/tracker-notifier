const fs = require('fs');
const path = require('path');
const express = require('express');
const debug = require('debug')('tracker-notifier:loader');
let rpath = path.join(__dirname, 'routes');

/**
 * Carga todos los módulos de forma recursiva dentro
 * de la carpeta de módulos de la API (/server/routes)
 */
function fun(app) {
    debug('Loading routes...');

    let files = walkSyncJS(rpath);
    files.forEach((file) => {
        app.use(require(file));
        debug('Loaded ' + file.replace(__dirname, ''));
    });

    debug('Starting tracker loop...');
    require('./tracker-loop').run();

    debug('Done!');
}

/**
 * Cargar una lista de forma recursiva de todos los archivos JavaScript
 * dentro de una carpeta definida
 */
function walkSyncJS(dir) {
    let files = fs.readdirSync(dir);
    let filelist = [];
    files.forEach(function(file) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            filelist = filelist.concat(walkSyncJS(fullPath));
        } else if(file.endsWith('.js')) {
            filelist.push(fullPath);
        }
    });

    return filelist;
}

module.exports = fun;