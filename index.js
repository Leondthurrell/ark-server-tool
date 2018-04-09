'use strict';
const fs = require('fs');
const myTools = require('./lib/myTools.js');
const modDiff = require('./lib/diff.js');
const ini = require('ini');

let config = myTools.loadConf('./config.json');
let serverConfigs;

/** Updates mods in new config and exports a diff list */
function updateMods() {
    let file = config.modfile.file;
    let header = config.modfile.header;
    let key = config.modfile.key;
    let mods = {
        old: serverConfigs[file].old[header][key].split(','),
        new: [],
        diff: {},
    };
    myTools.getCollection(config.collection, (updatedMods) => {
        mods.new = myTools.sortMods(updatedMods, config.modPriority);
        serverConfigs[file].new[header][key] = mods.new.join(',');
        mods.diff = modDiff.getDiff(mods.old, mods.new);
        myTools.listMods(mods.new, (data)=>{
            fs.writeFileSync('./diff/modlist.md', data, 'utf-8');
        });
        modDiff.renderDiff(mods.diff, (data)=>{
            fs.writeFileSync('./diff/moddiff.md', data, 'utf-8');
        });
        fs.writeFileSync('./server_configs/'+file, ini.stringify(serverConfigs[file].new));
    });
}

/**
 * Loads confings from file
 * optionally downloads them from ftp
 * @param {object} config
 * @param {boolian} download
 */
function loadConfigs(config, download) {
    serverConfigs = {};
    let stats = {
        local: {
            errors: [],
            success: 0,
        },
        remote: {
            errors: [],
            success: 0,
        },
    };
    /** loads config files files */
    function load() {
        for (let i in config.inifiles) {
            if (Object.prototype.hasOwnProperty.call(serverConfigs, i)) {
                let file = config.inifiles[i].name;
                if (fs.existsSync('./server_configs/remote/'+file)) {
                    if (!serverConfigs[file]) {
                        serverConfigs[file] = config.inifiles[i];
                    }
                    serverConfigs[file]['old'] = myTools.loadConf('./server_configs/remote/'+file);
                    stats.remote.success++;
                } else {
                    stats.remote.errors.push('No server version of '+file);
                }
                if (fs.existsSync('./server_configs/'+file)) {
                    if (!serverConfigs[file]) {
                    serverConfigs[file] = config.inifiles[i];
                }
                serverConfigs[file]['new'] = myTools.loadConf('./server_configs/'+file);
                stats.local.success++;
            } else {
                stats.local.errors.push('No local version of '+file);
            }
        }
    }
}
// # Todo: seperate download and parse
    if (download === true) {
        myTools.getServerConfigs(config.ftp, config.inifiles, (e)=>{
            if (e) {
                for (let i in e) {
                    if (e[i]) {
                    console.log('Error downloading '+e[i].filename);
                    console.log(e[i].message);
                    }
                }
            }
            load();
        });
    }
    load();
}

loadConfigs(config, false);
updateMods();
