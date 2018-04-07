var fs   = require('fs')
  , path = require('path')
  , ini = require('ini')
  , request = require('request')
  , cheerio = require('cheerio')
  , ftp = require('ftp')
  , arrayMove = require('array-move')

function sortMods(mods, priority){
	for(var i in priority){
		var itemIndex = mods.indexOf(priority[i].id)
		var itemPriority = priority[i].order
		mods = arrayMove(mods, itemIndex, itemPriority)
	}
	return mods
}

function LoadConf(file) {
    var config
    var error
    if(!file){
        error = "no valid config provided"
        throw error
    }
    if(path.extname(file) === '.json'){
            config = JSON.parse(fs.readFileSync(file,'utf-8'))
    }
    if(path.extname(file) === '.ini'){
            config = ini.parse(fs.readFileSync(file, 'utf-8'))
    }
    if(config){
        return config
    }
}

function logCallback(e, data){
    console.log("callback")
    if(e){
        console.log("Error: "+e)
    }
    if(data){
        console.log("Data:")
        console.log(data)
    }
}

function getServerConfigs(options, files, callback){
    var c = new ftp()
	var count = 0
	var errors = []
	var success = 0
    function done(e){
		count++
		if(count !== files.length){
            getFile()
        }
        if(count >= files.length){
            c.end()
            callback(errors)
            return
        }
    }
    function getFile(){
        var path = files[count].path+files[count].name
        c.get(path,(e, file)=>{
			if(e){
				e.filename = files[count].name
				errors.push(e)
				done(e)
				return
			}
			if(file){
				file.once('close', ()=>{
					success++
					done()
					return
				})
				file.pipe(fs.createWriteStream("./server_configs/remote/"+files[count].name))
			}
        })
    }
        c.on('ready', ()=>{
            getFile()
		})
        c.connect(options)
}

function ListMods(mods, callback){
    request.post('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/', {form:{itemcount: mods.length, publishedfileids: mods}}, (e, response, body)=>{
        var outarr = []
        if(e){
            return;
        }
        try {
            var parsed = JSON.parse(body);
        }
        catch(e){
            console.log('Error parsing response:'+e+'\n'+body);
        }
        var list = parsed.response.publishedfiledetails
        var n = 0
        for(var i in list){
            n++
            var temp = n+": "+list[i].title+"\n     http://steamcommunity.com/sharedfiles/filedetails/?id="+list[i].publishedfileid
            outarr.push(temp)
        }
        var outstr = outarr.join("\n")
        callback(outstr)
    });
}

function getCollection(collectionID, callback){
    var url = "http://steamcommunity.com/sharedfiles/filedetails/?id="+collectionID
    request(url, (error, response, body)=>{
      if(error){
        throw error
      }
      if(body){
        var $ = cheerio.load(body)
        var list = []
  
        data = $('.collectionItem')
        for(var i=0; i < data.length; i++){
          id = data[i].attribs.id
          modid = id.substring(id.indexOf("_")+1, id.length)
          list.push(modid)
        }
      }
      callback(list)
    })
  }

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function errorToString(e){
	return capitalizeFirst(e.message.substring(e.message.indexOf(" ")+1,e.message.indexOf(",")))
}

function getWorkshopDetails(list, next){
    data = {
        form:{
                itemcount: list.length,
                publishedfileids: list
            }
        }
    request.post('https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/'
                , data
                , (e, response, body)=>{
                    next(e,response,body)})
}

module.exports = {
    logCallback: logCallback,
    LoadConf: LoadConf,
    ListMods: ListMods,
    getCollection: getCollection,
    getServerConfigs: getServerConfigs,
	capitalizeFirst: capitalizeFirst,
	errorToString: errorToString,
	getWorkshopDetails: getWorkshopDetails,
	sortMods: sortMods
}