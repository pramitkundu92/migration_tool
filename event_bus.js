const EventEmitter = require('events');

let EventBus = (function() {
    let _instance;
    return {
        init() {
            _instance = new EventEmitter();
        },
        emit(event, data) {
            _instance.emit(event, data);
        },
        registerHandler(event, callback) {
            _instance.on(event, callback);
        }
    };
})();

module.exports = EventBus;