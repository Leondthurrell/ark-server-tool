let fs = require('fs');
let myTools = require('./lib/myTools.js');
let modDiff = require('./lib/diff.js');
let ini = require('ini');
let objDiff = require('deep-diff');

let config = myTools.loadConf('./config.json');
let serverConfigs;

/** Updates mods in new config and exports a diff list */
function updateMods() {
    file = config.modfile.file;
    header = config.modfile.header;
    key = config.modfile.key;
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

/** Gets differences in old and new config
 * then outputs diffrences to <filename>Diff.md
 * @param {object} file
 */
function iniDiff(file) {
    let ignore = [];
    if (!file) {
        console.log('Config not loaded');
        return;
    }
    if (!file.old) {
        console.log('No old file to compare to');
        return;
    }
    if (!file.new) {
        console.log('No new file to compare to');
        return;
    }
    if (file.ignore) {
        ignore = file.ignore;
    }
    let filename = file.name.substring(0, file.name.indexOf('.'))+'Diff.md';
    let filediff = objDiff(file.old, file.new);
    console.log(filename);
    let renderedDiff = modDiff.renderiniDiff(filediff, ignore);
    fs.writeFileSync('./server_configs/diff/'+filename, renderedDiff, 'utf-8');
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
        for (i in config.inifiles) {
            if (Object.prototype.hasOwnProperty.call(serverConfigs, i)) {
                file = config.inifiles[i].name;
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
                for (i in e) {
                    if (e[i]) {
                    console.log('Error downloading '+e[i].filename);
                    console.log(e[i].message);
                    }
                }
            }
            load();
        });
    }
    if (!download || download !== true) {
        console.log('Loading cached configs');
        load();
    }
}

loadConfigs(config, false);
updateMods();
