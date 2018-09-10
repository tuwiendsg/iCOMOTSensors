const child_process = require("child_process");
const fs = require("fs");
const promisify = require("util").promisify;
const db = require("./data/db");

const exec = promisify(child_process.exec);
const writeFile = promisify(fs.writeFile);

let currentPort = 3000;

function createService(config){
    let timestamp = Date.now();
    let serviceId = `service${config.image}${timestamp}`;
    config.serviceId = serviceId;
    return _runDocker(config).then(() => {
        return db.insert(config);
    })
}

function deleteService(serviceId){
    return _stopDocker(serviceId).then(() => {
        return db.remove({serviceId});
    });
}

function getService(serviceId){
    return db.findOne({serviceId});
}

function getAllServices(){
    return db.find();
}


function _runDocker(config){
    let cmd = `docker run -d ${config.image} --name ${config.serviceId}`;
    config.environment.forEach((env) => {
        cmd += ` -e ${env.name}='${env.value}'`;
    });

    let hostPorts = _generatePorts(config.ports.length);
    config.ports.forEach((port, index) => {
        cmd += ` -p ${hostPorts[index]}:${port}`
    });

    let writeFilePromises = [];
    config.files.forEach((file) => {
        writeFilePromises.push(writeFile(`/tmp/${config.serviceId}/${name}`, file.body));
        cmd += ` -v /tmp/${config.serviceId}/${name}:${file.path}`;
    });

    return Promise.all(writeFilePromises).then(() => {
        return exec(cmd);
    }).then((r) => {
        if(r.stderr) {
            console.log(r.stderr);
            throw new Error('error occurred starting docker service');
        }
        console.log(r.stdout);
    });
}

function _stopDocker(serviceId){
    return exec(`docker stop ${serviceId}`).then((res) => {
        if(r.stderr) {
            console.log(r.stderr);
            throw new Error('error occurred stopping docker service');
        }
        return exec(`docker rm ${serviceId}`);
    }).then((res) => {
        if(r.stderr) {
            console.log(r.stderr);
            throw new Error('error occurred removing docker service');
        }
    });
}

function _generatePorts(portNb){
    let ports = [];
    for(let i=0;i<portNb;i++){
        ports.push(currentPort++);
    }
    return ports;
}

module.exports = {
    createService,
    deleteService,
    getAllServices,
    getService
}