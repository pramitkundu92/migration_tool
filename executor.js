const exec = require('child_process').exec;
const fs = require('fs');

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

// create log file from tool output
function createLogFile(mapping, output) {
    return new Promise((resolve, reject)=>{
        fs.writeFile(modifyPaths(`${__dirname}/logs/${mapping.repoName}_${mapping.folderName}_${mapping.mappingName}.log`), output, (err)=>{
            if(err) {
                console.log('Error while writing logs to file');
            }
            resolve();
        });
    });
}

// change paths based on os
function modifyPaths(url) {
    let cmd = process.platform.indexOf('win32') > -1 ? url.replace(/\//g, '\\') : url;
    if(cmd.indexOf('-Xbootclasspath\\p')) {
        cmd = cmd.replace('-Xbootclasspath\\p', '-Xbootclasspath/p');
    }
    return cmd;
}
function createClasspath(paths) {
    return paths.join(process.platform.indexOf('win32') > -1 ? ';' : ':');
}
 
function triggerMigrationForMapping(mapping) {
    return new Promise((resolve,reject)=>{
        let repoData = Cache.getInstance().getItem('repositoryInfo'),
            classpath = createClasspath([`${__dirname}/executables/migration_tool/`]),
            cmd = `java -Xbootclasspath/p:${repoData.clientPath}/PowerCenterClient/MappingSDK/lib/externals/jaxb/lib/jaxb-impl.jar -cp ${classpath} -jar ${__dirname}/executables/migration_tool/migrator.jar ${mapping.folderName} ${mapping.mappingName} ${mapping.source} ${mapping.target} ${mapping.connection}`;
        /*
        exec(modifyPaths(cmd), (err, stdout, stderr)=>{
            if(err || stderr) {
                createLogFile(mapping, err || stderr).then(resp=>{
                    reject('failure');
                });                
            }
            else {
                let output = stdout.trim();
                createLogFile(mapping, output).then(resp=>{
                    if(output.indexOf('ObjectImport completed successfully')) {
                        resolve('success');
                    }
                    else {
                        reject('failure');
                    }
                });
            }
        });
        */
        let logFileName = modifyPaths(`${__dirname}/logs/${mapping.repoName}_${mapping.folderName}_${mapping.mappingName}.log`);
        fs.unlink(logFileName, (err)=>{
            let sp = exec(modifyPaths(cmd)), 
                stream = fs.createWriteStream(logFileName, {flags:'a'});
            sp.stdout.on('data', function (data) {
                stream.write(`${data.toString()}\n`);
            });
            sp.stderr.on('data', function (data) {
                stream.write(`${data.toString()}\n`);
            });
            sp.on('error', function(err) {
                stream.end();
                reject('failure');
            });
            sp.on('exit', function (code) {
                stream.end();
                let output = fs.readFileSync(logFileName);
                if(output.indexOf('ObjectImport completed successfully') > -1) {
                    resolve('success');
                }
                else {
                    reject('failure');
                }
            });
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