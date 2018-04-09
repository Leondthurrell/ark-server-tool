'use strict';
/** @module diff */
const fs = require('fs');
const difference = require('array-difference');
const myTools = require('./myTools.js');
const objDiff = require('deep-diff');


/** Gets differences in old and new config
 * then outputs diffrences to <filename>Diff.md
 * @param {object[]}
 * @param {object} object.new - new config file
 * @param {object} object.old - old config file
 */
function getINIDiff(file) {
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
    let fileName = file.name.substring(0, file.name.indexOf('.'))+'Diff.md';
    let fileDiff = objDiff(file.old, file.new);
    console.log(fileName);
    let renderedDiff = renderiniDiff(fileDiff, ignore);
    fs.writeFileSync('./server_configs/diff/'+fileName, renderedDiff, 'utf-8');
}

/**
 * returns a diffrence object
 * @param {number[]} oldlist
 * @param {number[]} newlist
 * @return {object}
 */
function getDiff(oldlist, newlist) {
    let diff = {
        list: difference(oldlist, newlist),
        added: [],
        removed: [],
    };
    for (let i in diff.list) {
        if (diff.list[i]) {
            if (newlist.indexOf(diff.list[i]) !== -1) {
                diff.added.push(diff.list[i]);
            }
            if (oldlist.indexOf(diff.list[i]) !== -1) {
                diff.removed.push(diff.list[i]);
            }
        }
    }
    return diff;
}

/** Creates difference text for INI files
 * @param {object} diff output from getDiff
 * @param {object[]} ignore keys to ingore
 * @return {string} markdown string
 */
function renderiniDiff(diff, ignore) {
    let outarr = [];
    let outobj = {
        added: ['**Added:**'],
        removed: ['\n**Removed:**'],
        changed: ['\n**Changed:**'],
    };
    for (let i in diff) {
        if (!ignore.includes(diff[i].path[1]) && diff[i].path.length > 1) {
            let item = diff[i].path[1];
            let change = diff[i].kind;
            let lhs = diff[i].lhs;
            let rhs = diff[i].rhs;

            if (change === 'N') {
                outobj.added.push(item+'='+diff[i].rhs);
            }
            if (change === 'D') {
                outobj.removed.push(item+'='+diff[i].lhs);
            }
            if (change === 'E') {
                outobj.changed.push(item+'= '+lhs+' => '+rhs);
            }
        }
    }
    for (let i in outobj) {
        if (outobj[i].length !== 1) {
            outarr = outarr.concat(outobj[i]);
        }
    }
    let outstr = outarr.join('\n');
    return outstr;
}

/**
 * creates a markdown string of differences in a mod list
 * @todo Scrap and rewrite
 * @param {object} diff
 * @param {function} callback
 */
function renderDiff(diff, callback) {
    if (diff.list) {
        myTools.getWorkshopDetails(diff.list, () => {
            let outstr;
            let outarr = [];
            let outobj = {
                added: [],
                removed: [],
            };
        if (diff.added !=='') {
            outobj.added.push('**Added: '+diff.added.length+'**');
        }
        if (diff.removed[0] !== '') {
            outobj.removed.push('**Removed: '+diff.removed.length+'**');
        }
        let data = JSON.parse(body);
        for (let i in data.response.publishedfiledetails) {
            if (Object.prototype.hasOwnProperty.call(data.response.publishedfiledetails, i)) {
                let item = data.response.publishedfiledetails[i];
                let temp = item.title+'\n      '+'http://steamcommunity.com/sharedfiles/filedetails/?id='+item.publishedfileid;
                if (diff.added.indexOf(item.publishedfileid) !== -1) {
                    outobj.added.push('+ '+temp);
                }
                if (diff.removed.indexOf(item.publishedfileid) !== -1) {
                    outobj.removed.push('- '+temp);
                }
            }
        }
        for (let i in outobj.added) {
            if (Object.prototype.hasOwnProperty.call(outobj.added, i)) {
                outarr.push(outobj.added[i]);
            }
        }
        for (let i in outobj.removed) {
            if (Object.prototype.hasOwnProperty.call(outobj.removed, i)) {
                outarr.push(outobj.removed[i]);
            }
        }
        outstr = outarr.join('\n');
        callback(outstr);
        });
    }
}

module.exports = {
    getDiff: getDiff,
    getINIDiff: getINIDiff,
    renderDiff: renderDiff,
    renderiniDiff: renderiniDiff,
};
