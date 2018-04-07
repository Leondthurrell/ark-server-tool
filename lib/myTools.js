let fs = require('fs');
let path = require('path');
let ini = require('ini');
let request = require('request');
let cheerio = require('cheerio');
let FTP = require('ftp');
let arrayMove = require('array-move');

/**
 * Sorts list of mods by priority
 * @param {array} mods array of mods
 * @param {obj} priority object containing items and priorities
 * @return {array} sorted list of mods
 */
function sortMods(mods, priority) {
    for (let i in priority) {
        if (Object.prototype.hasOwnProperty.call(priority, i)) {
            let itemIndex = mods.indexOf(priority[i].id);
            let itemPriority = priority[i].order;
            mods = arrayMove(mods, itemIndex, itemPriority);
        }
    }
    return mods;
}

/**
 * Loads config from file
 * @param {string} file path to file
 * @return {obj} parsed json object
 */
function loadConf(file) {
    let config = null;
    if (!file) {
        throw new Error('no valid config provided');
    }
    if (!fs.existsSync(file)) {
        throw new Error('File '+file+' doesn\'t exist');
    }
    if (path.extname(file) === '.json') {
            config = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    if (path.extname(file) === '.ini') {
            config = ini.parse(fs.readFileSync(file, 'utf-8'));
    }
    if (config) {
        return config;
    }
    throw new Error('File not supported');
}

/**
 * @param {object} options options for ftp
 * @param {object} files object containing files to get
 * @param {*} callback
 */
function getServerConfigs(options, files, callback) {
    let c = new FTP();
    let errors = [];
    c.on('ready', ()=>{
        for (let i; i < files.length; i++) {
            let path = files[i].path+files[i].name;
            c.get(path, (e, file)=>{
                if (e) {
                    e.filename = files[i].name;
                    errors.push(e);
                    done(e);
                    return;
                }
                if (file) {
                    file.pipe(fs.createWriteStream('./server_configs/remote/'+files[i].name));
                }
            });
        }
        c.end();
        callback(errors);
    });
    c.connect(options);
}

/**
 * gets info on mods and generates a list
 * @param {array} mods array of mods
 * @param {function} callback
 */
function listMods(mods, callback) {
    request.post('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/', {form: {itemcount: mods.length, publishedfileids: mods}}, (e, response, body)=>{
        let outarr = [];
        if (e) {
            return;
        }
        try {
            let parsed = JSON.parse(body);
            let list = parsed.response.publishedfiledetails;
            for (let i; i > list.length; i++) {
                let temp = (i+1)+': '+list[i].title+'\n     http://steamcommunity.com/sharedfiles/filedetails/?id='+list[i].publishedfileid;
                outarr.push(temp);
            }
        } catch (e) {
            console.log('Error parsing response:'+e+'\n'+body);
        }
        let outstr = outarr.join('\n');
        callback(outstr);
    });
}

/**
 * Scrapes stream collection website for list of mods
 * @param {string} collectionID
 * @param {function} callback
 */
function getCollection(collectionID, callback) {
    let url = 'http://steamcommunity.com/sharedfiles/filedetails/?id='+collectionID;
    request(url, (error, response, body)=>{
      if (error) {
        throw error;
      }
      if (body) {
        let $ = cheerio.load(body);
        let list = [];

        data = $('.collectionItem');
        for (let i=0; i < data.length; i++) {
          id = data[i].attribs.id;
          modid = id.substring(id.indexOf('_')+1, id.length);
          list.push(modid);
        }
      }
      callback(list);
    });
  }

/**
 * Capitalizes the first letter in a string
 * @param {string} string String to capitalize
 * @return {string} New string
 */
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {error} e error to parse
 * @return {string} substring of error message
 */
function errorToString(e) {
    return capitalizeFirst(e.message.substring(e.message.indexOf(' ')+1, e.message.indexOf(',')));
}

/**
 * Gets mod file details from steam api
 * @param {array} list list of mods to lookup
 * @param {function} next callback function
 */
function getWorkshopDetails(list, next) {
    if (!Array.isArray(list)) {
        throw new TypeError('Expected an array got a '+typeof list);
    }
    data = {
        form: {
                itemcount: list.length,
                publishedfileids: list,
            },
        };
    request.post('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/'
                , data
                , next);
}

module.exports = {
    loadConf: loadConf,
    listMods: listMods,
    getCollection: getCollection,
    getServerConfigs: getServerConfigs,
    capitalizeFirst: capitalizeFirst,
    errorToString: errorToString,
    getWorkshopDetails: getWorkshopDetails,
    sortMods: sortMods,
};
