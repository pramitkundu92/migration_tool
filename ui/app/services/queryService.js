import axios from 'axios';

export default class QueryService {

    constructor() {
        this.source = axios.CancelToken.source();
        this.api = '/api/v1';
        this.mappingsUrl = '/mappings';
        this.repositoryUrl = '/repository';
        this.savedDataUrl = '/savedData';
        this.migrationUrl = '/startMigration';
        this.typesUrl = '/getMappingTypes';
    }

    getHeaders() {
        return {
            "Content-type": "application/json"
        };
    }

    buildUrl(url) {
        let origin = window.location.port === '7792' ? window.location.origin : `https://localhost:7792`
        return `${origin}${this.api}${url}`;
    }

    getExtraOptions() {
        return {
            "headers": this.getHeaders(),
            "cancelToken": this.source.token
        };
    }

    cancelPendingRequests() {
        this.source.cancel('Cancel pending requests');
    }

    getSavedData() {
        return new Promise((resolve, reject)=>{
            axios.get(this.buildUrl(this.savedDataUrl), this.getExtraOptions()).then(({data})=>{
                resolve(data);
            }, err=>{
                reject(err);
            });
        });
    }

    getFolderMappings() {
        return new Promise((resolve, reject)=>{
            axios.get(this.buildUrl(this.mappingsUrl), this.getExtraOptions()).then(({data})=>{
                resolve(data);
            }, err=>{
                reject(err);
            });
        });
    }

    saveRepositoryInfo(info) {
        return new Promise((resolve, reject)=>{
            axios.post(this.buildUrl(this.repositoryUrl), info, this.getExtraOptions()).then(({data})=>{
                resolve(data);
            }, err=>{
                reject(err);
            });
        });
    }

    startMigration(mappings) {
        return new Promise((resolve, reject)=>{
            axios.post(this.buildUrl(this.migrationUrl), mappings, this.getExtraOptions()).then(({data})=>{
                resolve(data);
            }, err=>{
                reject(err);
            });
        });
    }

    getMappingTypes() {
        return new Promise((resolve, reject)=>{
            axios.get(this.buildUrl(this.typesUrl), this.getExtraOptions()).then(({data})=>{
                resolve(data);
            }, err=>{
                reject(err);
            });
        });
    }

}