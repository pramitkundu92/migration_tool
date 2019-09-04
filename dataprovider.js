const fs = require('fs');

const Cache = require('./cache.js');
const Executor = require('./executor.js');

function prepareFolderData(data) {
    let processedData = [], repo = Cache.getInstance().getItem('repositoryInfo'), statusMap = Cache.getInstance().getItem('migrationStatus') || {},
        delim = Cache.getInstance().delimeter;
    if(repo) {
        let folders = [];
        Object.keys(data).forEach(key=>{
            if(data[key].length > 0) {
                folders.push({
                    name: key,
                    mappings: data[key].map(v=>{
                        let mappingKey = `${repo.repoName}${delim}${key}${delim}${v}`;
                        if(!statusMap.hasOwnProperty(mappingKey)) {
                            statusMap[mappingKey] = 0;
                        }
                        return {
                            name: v,
                            key: mappingKey,
                            status: statusMap[mappingKey]
                        };
                    })
                });
            }
        });
        Cache.getInstance().setItem('migrationStatus', statusMap);
        processedData.push({
            name: repo.repoName,
            folders
        });
        prepareTreeData(processedData[0]);
    }
    return processedData;
}

function prepareTreeData(data) {
    if(!(data.hasOwnProperty('folders') || data.hasOwnProperty('mappings'))) {
        return;
    }
    else {
        if(data.hasOwnProperty('folders')) {
            data.folders.forEach(folder=>{
                folder.expanded = true;
                folder.selected = true;
                prepareTreeData(folder);
            });
        }
        else if(data.hasOwnProperty('mappings')) {
            data.mappings.forEach(mapping=>{
                mapping.expanded = true;
                mapping.selected = true;
                prepareTreeData(mapping);
            });
        }
    }
}

function DataProvider() {};

DataProvider.prototype.getMappings = function(config) {
    return new Promise((resolve, reject)=>{
        Executor.getFolderMappings().then(data=>{
            resolve(prepareFolderData(data));
        }, err=>{
            reject(err);
        });
    });
};

DataProvider.prototype.startMigration = function(mappings) {
    return new Promise((resolve, reject)=>{
        if(mappings.length > 0) {
            Cache.getInstance().setItem('types', {
                'source': mappings[0].source,
                'target': mappings[0].target,
                'connection': mappings[0].connection
            });
        }
        Executor.startMigration(mappings).then(data=>{
            resolve(data);
        }, err=>{
            reject(err);
        });
    });
};

DataProvider.prototype.getDataForFileDownload = function(mapping) {
    return new Promise((resolve, reject)=>{
        let logFileName = Executor.modifyPaths(`${__dirname}/logs/${mapping.repoName}_${mapping.folderName}_${mapping.mappingName}.log`);
        let stream = fs.createReadStream(logFileName), chunks = [];
        stream.on('error', err=>{
            reject({
                'status': 'File not found'
            });
        });
        stream.on('data', chunk=>{
            chunks.push(chunk);
        });
        stream.on('close', ()=>{
            resolve({
                'fileName': `${mapping.repoName}_${mapping.folderName}_${mapping.mappingName}.log`,
                'type': 'text/plain',
                'content': Buffer.concat(chunks)
            });
        });
    });
};

module.exports = DataProvider;