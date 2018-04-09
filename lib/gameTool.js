`use strict`;
const FTP = require('ftp');
const ini = require('ini');
const fs = require('fs');

/**
 * Ark GameTool Class
 * @todo write description
 */
class GameTool {
    /**
     * constructor
     * @param {object} config server config object or file path
     */
    constructor({host, port, configs, ftp, mods, discord}) {
        this.host = host;
        this.port = port;
        this.configs = configs;
        this.ftp = ftp;
        this.modMeta = mods;
        this.discord = discord;
        this._messages = {};
        console.log(this);
    }

    /**
     * downloads config files from the server
     * @param {object} ftp object containing ftp details.
     * @param {callback} done
     */
    downloadConfigs(ftp=this.ftp) {
        let c = new FTP();
        let config;
        let errors = [];
        if (ftp) {
            config = ftp;
        }
        if (!('host' in config)) {
            config.host = this.host;
        }
        c.on('ready', ()=>{
            for (let i = 0; i < this.configs.length; i++) {
                let path = this.configs[i].path+this.configs[i].name;
                let savefile = './server_configs/remote/'+this.configs[i].name;
                let writeStream = fs.createWriteStream(savefile);
                c.get(path, (e, file)=>{
                    if (e) {
                        e.filename = this.configs[i].name;
                        errors.push(e);
                        this.sendErrors();
                    }
                    if (file) {
                        file.pipe(writeStream);
                        file.on('end', ()=>{
                            this.readConfigs(i);
                        });
                    }
                });
            }
            c.end();
            for (let i in errors) {
                if (Object.prototype.hasOwnProperty.call(errors, i)) {
                    this._messages.errors.push(errors[i]);
                }
            }
        });
        c.connect(config);
    }

    /**
     * Sends errors in messages buffer to console
     */
    sendErrors() {
        let errors = this._messages.errors;
        for (let i in errors) {
            if (Object.prototype.hasOwnProperty.call(errors, i)) {
                console.log(errors[i]);
            }
        }
    }

    /**
     * load server config from file
     * @param {integer} i index of file to load
     */
    readConfigs(i) {
        let savefile = './server_configs/remote/'+this.configs[i].name;
        this.configs[i].content = ini.parse(fs.readFileSync(savefile, 'utf-8'));
    }
}

module.exports = GameTool;
