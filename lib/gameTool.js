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
     * Reads the given config file file.
     */
    readConfig(fileName, path, alias) {
        let saveFile = path + fileName;
        if(alias){
            fileName = alias;
        }
        this.configs[fileName].content = ini.parse(fs.readFileSync(saveFile, 'utf-8'));
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
        if (config === undefined) {
            config.host = this.host;
        }
        if (!fs.existsSync("./server_configs/")){
            !fs.mkdirSync('./server_configs/');
        }
        if (!fs.existsSync('./server_configs/remote/')){
            fs.mkdirSync('./server_configs/remote/')
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
                            this.readConfig(i, './server_configs/remote/');
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
}

let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
console.log(config);
let serverTool = new GameTool(config);

serverTool.downloadConfigs();
console.log(serverTool.modMeta);


//module.exports = GameTool;
