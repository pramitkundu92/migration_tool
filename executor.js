const exec = require('child_process').exec;

const Cache = require('./cache.js');
const EventBus = require('./event_bus.js');

// function to update migration status
function updateStatus(mapping, status) {
    let statusMap = Cache.getInstance().getItem('migrationStatus');
    if(statusMap.hasOwnProperty(mapping.key)) {
        statusMap[mapping.key] = status;
    }
    Cache.getInstance().setItem('migrationStatus', statusMap);
    EventBus.emit('statusUpdate', {
        'key': mapping.key,
        'repoName': mapping.repoName,
        'folderName': mapping.folderName,
        'mappingName': mapping.mappingName,
        'status': status
    });
}
function updateMultipleStatus(mappings, status) {
    let statusMap = Cache.getInstance().getItem('migrationStatus');
    mappings.forEach(mapping=>{
        if(statusMap.hasOwnProperty(mapping.key)) {
            statusMap[mapping.key] = status;
        }
    });
    Cache.getInstance().setItem('migrationStatus', statusMap);
    EventBus.emit('statusUpdate', {
        'multiple': true,
        'mappings': mappings,
        'status': status
    });
}

// change paths based on os
function modifyPaths(url) {
    return process.platform.indexOf('win') > -1 ? url.replace(/\//g, '\\') : url;
}
function createClasspath(paths) {
    return paths.join(process.platform.indexOf('win') > -1 ? ';' : ':');
}
 
function triggerMigrationForMapping(mapping) {
    return new Promise((resolve,reject)=>{
        let repoData = Cache.getInstance().getItem('repositoryInfo'),
            classpath = createClasspath([`${__dirname}/executables/migration_tool/`]);
        let cmd = `java -Xbootclasspath/p:${repoData.clientPath}/PowerCenterClient/MappingSDK/lib/externals/jaxb/lib/jaxb-impl.jar -cp ${classpath} -jar ${__dirname}/executables/migration_tool/migrator.jar ${mapping.folderName} ${mapping.mappingName} ${mapping.source} ${mapping.target} ${mapping.connection}`;
        exec(modifyPaths(cmd), (err, stdout, stderr)=>{
            if(err || stderr) {
                reject('failure');
            }
            else {
                let output = stdout.trim();
                if(output.indexOf('Object created successfully')) {
                    resolve('success');
                }
                else {
                    reject('failure');
                }
            }
        });
    });
}

module.exports = {
    getFolderMappings: ()=>{
        return new Promise((resolve,reject)=>{
            let data = Cache.getInstance().getItem('databaseInfo'),
                classpath = createClasspath([
                    `${__dirname}/executables/dependency/java-json.jar`,
                    `${__dirname}/executables/dependency/ojdbc8.jar`,
                    `${__dirname}/executables/json_generation/bin/`
                ]);
            let cmd = `java -cp ${classpath} JDBCConnection ${data.dbName} ${data.dbPort} ${data.dbUser} ${data.dbPass} ${data.dbService}`;
            exec(modifyPaths(cmd), (err, stdout, stderr)=>{
                if(err) {
                    reject(err);
                }
                else {
                    let output = stdout.trim();
                    if(output) {
                        resolve(JSON.parse(output));
                    }
                    else {
                        resolve({});
                    }
                }
            });
        });
    },
    startMigration: (mappings)=>{
        return new Promise((resolve,reject)=>{
            updateMultipleStatus(mappings, 1);
            mappings.forEach((mapping, i)=>{
                setTimeout(()=>{
                    triggerMigrationForMapping(mapping).then(resp=>{
                        updateStatus(mapping, 2);
                    }, err=>{
                        updateStatus(mapping, 3);
                    });
                }, ((i%10)*1000));
            });
            resolve({
                'status': 'Started Migration'
            });
        });
    }
};