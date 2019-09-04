const { renderTemplateFile } = require('template-file');
const path = require('path');
const fs = require('fs');

const DataProvider = require('./dataprovider.js');
const Cache = require('./cache.js');

function UrlMappings(router) {
    this.router = router;
    this.dataProvider = new DataProvider();
}

// register all handlers/controllers for each REST API

function getMappings(req, res) {
    this.dataProvider.getMappings().then(data=>{
        res.json(data);
        res.status(200);
    }, err=>{
        res.json(err);
        res.status(500);
    });
}

function saveRepositoryInfo(req, res) {
    updateConfigFromTemplate(req.body).then(resp=>{
        res.json({
            'status': 'Repository info saved successfully'
        });
        res.status(200);
    }, err=>{
        res.json(err);
        res.status(500);
    });
}

function updateConfigFromTemplate(data) {
    return new Promise((resolve, reject)=>{
        let template = path.join(__dirname, './templates/pcconfig.tmpl'), target = path.join(__dirname, './resources/pcconfig.properties');
        renderTemplateFile(template, {...data.repo, ...data.database}).then(renderStr=>{
            fs.unlink(target, err=>{
                fs.writeFile(target, renderStr, err=>{
                    if(err) {
                        reject(err);
                    }
                    else {
                        Cache.getInstance().setItem('repositoryInfo', data.repo);
                        Cache.getInstance().setItem('databaseInfo', data.database);
                        resolve();
                    }
                });
            });
        }, err=> {
            reject(err);
        });
    });
}

function getSavedData(req, res) {
    res.json({
        'repo': Cache.getInstance().getItem('repositoryInfo') || {},
        'database': Cache.getInstance().getItem('databaseInfo') || {}
    });
    res.status(200);
}

function startMigration(req, res) {
    this.dataProvider.startMigration(req.body).then(resp=>{
        res.json(resp);
        res.status(200);
    }, err=>{
        res.json(err);
        res.status(500);
    });
}

function getMappingTypes(req, res) {
    res.json({
        'types': Cache.getInstance().getItem('types') || {
            'source': '',
            'target': '',
            'connection': ''
        }
    });
    res.status(200);
}

function getDataForFileDownload(req, res) {
    this.dataProvider.getDataForFileDownload(req.body).then(resp=>{
        res.json(resp);
        res.status(200);
    }, err=>{
        res.json(err);
        res.status(500);
    });
}

// initialize the API routes and associate controllers
UrlMappings.prototype.init = function() {
    this.router.get('/savedData', getSavedData.bind(this));
    this.router.get('/mappings', getMappings.bind(this));
    this.router.post('/repository', saveRepositoryInfo.bind(this));
    this.router.post('/startMigration', startMigration.bind(this));
    this.router.get('/getMappingTypes', getMappingTypes.bind(this));
    this.router.post('/downloadLogFile', getDataForFileDownload.bind(this));
}

module.exports = UrlMappings;