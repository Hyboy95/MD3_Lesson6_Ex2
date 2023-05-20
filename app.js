const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');

const handle = {};

const server = http.createServer((req,res) => {
    let urlPath = url.parse(req.url, true).pathname;
    switch(urlPath) {
        case '/calculator':
            if (req.method ==="GET") handle.getCalculatorPage(req,res).catch(err => console.log(err.message));
            else handle.calculator(req,res).catch(err => console.log(err.message));
            break;
        case '/result':
            handle.result(req,res).catch(err => console.log(err.message));
            break;    
        default:
            res.writeHead(404);
            res.end('Page not found');
    }
})

server.listen(3000, 'localhost', () => console.log('Server is running at http://localhost:3000/calculator'));

handle.readFileData = async (filePath) => {
    return new Promise((resolve,reject) => {
        fs.readFile(filePath, 'utf-8', (err,data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
}

handle.writeFileData = async (filePath,data) => {
    return new Promise((resolve,reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) reject(err);
            resolve();
        })
    })
}

handle.getCalculatorPage = async (req,res) => {
    let data = await handle.readFileData('./views/calculator.html');
    res.writeHead(201,{'Content-Text':'text/html'});
    res.write(data);
    res.end();
}

handle.calculator = async (req,res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', async () => {
        data = qs.parse(data);
        await handle.writeFileData('./session/result.json', JSON.stringify(data));
        res.writeHead(301,{location: '/result'});
        res.end();
    })
}

handle.result = async (req,res) => {
    let data = await handle.readFileData('./session/result.json');
    let dataDisplay = await handle.readFileData('./views/result.html');
    data = JSON.parse(data);
    dataDisplay = dataDisplay.replace('{result}', eval(data.num_1 + data.operator + data.num_2));
    res.writeHead(201, {'Content-Text':'text/html'});
    res.write(dataDisplay);
    res.end();
}
