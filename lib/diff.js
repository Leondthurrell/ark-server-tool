let difference = require('array-difference');
let myTools = require('./myTools.js');

/**
 * returns a diffrence object
 * @param {array} oldlist
 * @param {array} newlist
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
 * @param {array} ignore keys to ingore
 * @return {string} markdown string
 */
function renderiniDiff(diff, ignore) {
    let outarr = [];
    let outobj = {
        added: ['**Added:**'],
        removed: ['\n**Removed:**'],
        changed: ['\n**Changed:**'],
    };
    for (i in diff) {
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
    for (i in outobj) {
        if (outobj[i].length !== 1) {
            outarr = outarr.concat(outobj[i]);
        }
    }
    let outstr = outarr.join('\n');
    return outstr;
}

/**
 * creates a markdown string of differences in a mod list
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
        data = JSON.parse(body);
        for (i in data.response.publishedfiledetails) {
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
        for (i in outobj.added) {
            if (Object.prototype.hasOwnProperty.call(outobj.added, i)) {
                outarr.push(outobj.added[i]);
            }
        }
        for (i in outobj.removed) {
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
    renderDiff: renderDiff,
    renderiniDiff: renderiniDiff,
};
