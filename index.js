var fs = require('fs')
  , myTools = require('./lib/myTools.js')
  , modDiff = require('./lib/diff.js')
  , ini = require('ini')
  , objDiff = require('deep-diff')

var config = myTools.LoadConf('./config.json')
var serverConfigs

function updateMods(){
    file = config.modfile.file
    header = config.modfile.header
    key = config.modfile.key
    var mods = {
        old: serverConfigs[file].old[header][key].split(','),
        new: [],
        diff: {}
    }
    myTools.getCollection(config.collection, (updatedMods)=>{
        mods.new = myTools.sortMods(updatedMods, config.modPriority)
        serverConfigs[file].new[header][key] = mods.new.join(',');
        mods.diff = modDiff.getDiff(mods.old, mods.new)
        myTools.ListMods(mods.new,(data)=>{
            fs.writeFileSync('./diff/modlist.md', data, 'utf-8')
        })
        modDiff.renderDiff(mods.diff, (data)=>{
            fs.writeFileSync('./diff/moddiff.md', data, 'utf-8')
        })
        fs.writeFileSync('./server_configs/'+file, ini.stringify(serverConfigs[file].new))
    })
}
// # NOTE: Test
// Note: Test
function iniDiff(file){
    var ignore = []
    if(!file){
        console.log("Config not loaded")
        return
    }
    if(!file.old){
        console.log("No old file to compare to")
        return
    }
    if(!file.new){
        console.log("No new file to compare to")
        return
    }
    if(file.ignore){
        ignore = file.ignore
    }
    var filename = file.name.substring(0, file.name.indexOf('.'))+"Diff.md"
    var filediff = objDiff(file.old, file.new)
    console.log(filename)
    var renderedDiff = modDiff.renderiniDiff(filediff, ignore)
    fs.writeFileSync('./server_configs/diff/'+filename,renderedDiff,'utf-8')
}

function loadConfigs(config, download) {
    serverConfigs = {}
    var stats = {
        local: {
            errors: [],
            success: 0
        },
        remote: {
            errors: [],
            success: 0
        }
    }

    function load(){
        for(i in config.inifiles){
            file = config.inifiles[i].name
            if(serverConfigs)
            if(fs.existsSync("./server_configs/remote/"+file)){
                if(!serverConfigs[file]){
                    serverConfigs[file] = config.inifiles[i]
                }
                serverConfigs[file]["old"] = myTools.LoadConf("./server_configs/remote/"+file)
                stats.remote.success++
            } else {
                stats.remote.errors.push("No server version of "+file)
            }
            if(fs.existsSync("./server_configs/"+file)){
                if(!serverConfigs[file]){
                    serverConfigs[file] = config.inifiles[i]
                }
                serverConfigs[file]["new"] = myTools.LoadConf("./server_configs/"+file)
                stats.local.success++
            } else {
                stats.local.errors.push("No local version of "+file)
            }
        }
    }

    if(download === true){
        myTools.getServerConfigs(config.ftp,config.inifiles,(e)=>{
            if(e){
                for(i in e){
                    console.log("Error downloading "+e[i].filename)
                    console.log(e[i].message)
                }
            }
            load()
        })
    }
    if(!download || download !== true){
        console.log('Loading cached configs')
        load()
    }
}

loadConfigs(config, false)
updateMods()
