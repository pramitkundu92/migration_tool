const fs = require('fs');
const path = require('path');

function Cache() {
    this.cacheFilePath = path.join(__dirname, './store.json');
    this.delimeter = '#@#';
}

Cache.prototype.init = function() {
    // load cache from file if present
    try {
       this.data = JSON.parse(fs.readFileSync(this.cacheFilePath)); 
    }
    catch(e) {
        this.data = {};
    }
}

Cache.prototype.getFullCache = function() {
    return this.data;
}

Cache.prototype.getFilePath = function(e) {
    return this.cacheFilePath;
}

Cache.prototype.setItem = function(key, value) {
    this.data[key] = value;
    return;
}

Cache.prototype.getItem = function(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : undefined; 
}

let CacheController = (function() {
    let _instance;
    function createInstance() {
        return new Cache();
    }
    return {
        getInstance: function() {
            if(!_instance) {
                _instance = createInstance(); 
                _instance.init();
            }
            return _instance;
        }
    };
})();

module.exports = CacheController;