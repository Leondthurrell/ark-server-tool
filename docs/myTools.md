# myTools





* * *

### myTools.verifyModList(list) 

verifies an array of mod ids

**Parameters**

**list**: `array`, of mod ids



### myTools.sortMods(mods, priority) 

Sorts list of mods by priority

**Parameters**

**mods**: `array`, array of mods

**priority**: `obj`, object containing items and priorities

**Returns**: `array`, sorted list of mods


### myTools.loadConf(file) 

Loads config from file

**Parameters**

**file**: `string`, path to file

**Returns**: `obj`, parsed json object


### myTools.getServerConfigs(options, files, callback) 

**Parameters**

**options**: `object`, options for ftp

**files**: `object`, object containing files to get

**callback**: `*`



### myTools.listMods(mods, callback) 

gets info on mods and generates a list

**Parameters**

**mods**: `array`, array of mods

**callback**: `function`, gets info on mods and generates a list



### myTools.getCollection(collectionID, callback) 

Scrapes stream collection website for list of mods

**Parameters**

**collectionID**: `string | number`, Scrapes stream collection website for list of mods

**callback**: `requestCallback`, Scrapes stream collection website for list of mods



### myTools.capitalizeFirst(string) 

Capitalizes the first letter in a string

**Parameters**

**string**: `string`, String to capitalize

**Returns**: `string`, New string


### myTools.errorToString(e) 

convert error message to string
note: needs work

**Parameters**

**e**: `error`, error to parse

**Returns**: `string`, substring of error message


### myTools.getWorkshopDetails(list, next) 

Gets mod file details from steam api

**Parameters**

**list**: `array`, array of mod ids

**next**: `function`, callback function




* * *










