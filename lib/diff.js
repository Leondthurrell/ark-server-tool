var fs = require('fs')
  , request = require('request')
  , difference = require('array-difference')
  , myTools = require('./myTools.js')

function getDiff(oldlist, newlist){
    var diff = {
        list: difference(oldlist, newlist),
        added: [],
        removed: []
    }
    for(var i in diff.list){
        if(newlist.indexOf(diff.list[i]) !== -1){
            diff.added.push(diff.list[i])
        }
        if(oldlist.indexOf(diff.list[i]) !== -1){
            diff.removed.push(diff.list[i])
        }
    }
    return diff
}

function renderiniDiff(diff, ignore){
    var outarr = []
    var outobj = {
        added:["**Added:**"],
        removed:["\n**Removed:**"],
        changed:["\n**Changed:**"]
    }
    for(i in diff){
        var item = diff[i].path[1]
        if(!ignore.includes(item) && diff[i].path.length > 1){
            var change = diff[i].kind
            var lhs = diff[i].lhs
            var rhs = diff[i].rhs

            if(change === "N"){
                outobj.added.push(item+"="+diff[i].rhs)
            }
            if(change === "D"){
                outobj.removed.push(item+"="+diff[i].lhs)
            }
            if(change === "E"){
                outobj.changed.push(item+"= "+lhs+" => "+rhs)
            }
        }
    }
    for(i in outobj){
        if(outobj[i].length !== 1){
            outarr = outarr.concat(outobj[i])
        }
    }
    var outstr = outarr.join("\n")
    return outstr
}

function renderDiff(diff, callback){
    function done(e,response,body){
        var outstr
        var outarr = []
        var outobj = {
            added: [],
            removed: []
        }
        if(diff.added !==''){
            outobj.added.push("**Added: "+diff.added.length+"**")
        }
        if(diff.removed[0] !== ''){
            outobj.removed.push("**Removed: "+diff.removed.length+"**")
        }
        data = JSON.parse(body)
        for(i in data.response.publishedfiledetails){
            var item = data.response.publishedfiledetails[i]
            var temp = item.title+"\n      "+'http://steamcommunity.com/sharedfiles/filedetails/?id='+item.publishedfileid
            if(diff.added.indexOf(item.publishedfileid) !== -1){
                outobj.added.push("+ "+temp)
            }
            if(diff.removed.indexOf(item.publishedfileid) !== -1){
                outobj.removed.push("- "+temp)
            }
        }
        for(i in outobj.added){
            outarr.push(outobj.added[i])
        }
        for(i in outobj.removed){
            outarr.push(outobj.removed[i])
        }
        outstr = outarr.join("\n")
        callback(outstr)
        }

    if(diff.list){
        myTools.getWorkshopDetails(diff.list, done)
    }
}

module.exports = {
    getDiff: getDiff,
    renderDiff: renderDiff,
    renderiniDiff: renderiniDiff
}