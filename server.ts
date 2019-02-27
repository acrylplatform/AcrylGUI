import { createSecureServer } from 'http2';
import { createServer } from 'https';
import { route, parseArguments } from './ts-scripts/utils';
import { readFileSync } from 'fs';
import { serialize, parse as parserCookie } from 'cookie';
import { compile } from 'handlebars';
import { parse } from 'url';
import { TBuild, TConnection, TPlatform } from './ts-scripts/interface';
import { readFile } from 'fs-extra';
import { join } from 'path';
import * as fs from 'fs';
import * as qs from 'querystring';
import * as opn from 'opn';

const ip = require('my-local-ip')();


const connectionTypes: Array<TConnection> = ['mainnet', 'testnet'];
const buildTypes: Array<TBuild> = ['dev', 'normal', 'min'];
const privateKey = readFileSync('localhost.key').toString();
const certificate = readFileSync('localhost.crt').toString();


const handler = function (req, res) {
    const url = parse(req.url);

    if (url.href.includes('/choose/')) {
        const [platform, connection, build] = url.href.replace('/choose/', '').split('/');
        const cookie = serialize('session', `${platform},${connection},${build}`, {
            maxAge: 60 * 60 * 24,
            path: '/'
        });

        res.setHeader('Set-Cookie', cookie);
        res.statusCode = 302;
        res.setHeader('Location', req.headers.referer);
        res.end();

        return null;
    }

    if (req.url.includes('/package.json')) {
        res.end(readFileSync(join(__dirname, 'package.json')));
        return null;
    }

    const parsed = parseCookie(req.headers.cookie);
    if (!parsed) {
        readFile(join(__dirname, 'chooseBuild.hbs'), 'utf8').then((file) => {
            res.end(compile(file)({ links: getBuildsLinks(req.headers['user-agent']) }));
        });
    } else {
        route(parsed.connection, parsed.build, parsed.platform)(req, res);
    }
};

function createMyServer(port) {

    const server = createSecureServer({ key: privateKey, cert: certificate });
    const url = `https://localhost:${port}`;

    server.addListener('request', request);
    server.listen(port);
    console.log(`Listen port ${port}...`);
    console.log('Available urls:');

    console.log(url);
    opn(url);
}

function createSimpleServer({ port = 8000 }) {
    const server = createServer({ key: privateKey, cert: certificate });
    server.addListener('request', request);
    server.listen(port);
    console.log(`Listen port ${port}, for simple server`);
    console.log(`https://${ip}:${port}`);
}

createMyServer(8080);
const args = parseArguments() || Object.create(null);
if (args.startSimple) {
    createSimpleServer(args);
}

function getBuildsLinks(userAgent: string = ''): Array<{ url: string; text: string }> {
    const result = [];
    const platform: TPlatform = userAgent.includes('Electron') ? 'desktop' : 'web';

    connectionTypes.forEach((connection) => {
        buildTypes.forEach((build) => {
            result.push({
                url: `/choose/${platform}/${connection}/${build}`,
                text: `${platform} ${connection} ${build}`
            });
        });
    });

    return result;
}

function parseCookie(header = ''): IRequestData {
    const [platform, connection, build] = ((parserCookie(header) || Object.create(null)).session || '').split(',');
    if (!(build && connection && platform)) {
        return null;
    }
    return { platform, connection, build } as IRequestData;
}

const handlers = [
    coinomat,
    manifest,
    sw,
    browserconfig,
    wavesClientConfig,
    handler as any
];

function request(req, res) {
    let index = 0;
    function next() {
        index++;
        if (handlers[index - 1]) {
            handlers[index - 1](req, res, next);
        }
    }

    next();
}

function browserconfig(req, res, next) {
    if (!req.url.includes('browserconfig.xml')) {
        next();
        return null;
    }
    let response_xml_as_string = '';

    const path = join(__dirname, 'src/browserconfig.xml');
    console.log('path :', path);
    if (fs.existsSync(path)) {
        response_xml_as_string = fs.readFileSync(path, 'utf8')|| '';
    }
    const cType = 'text/html; charset=utf-8;';
    res.setHeader('Content-Type', cType); 
    res.end(response_xml_as_string);
    return false;
}

function manifest(req, res, next) {
    if (!req.url.includes('manifest.json')) {
        next();
        return null;
    }
    let response_json = { error: 'oops' };

    const path = join(__dirname, 'src/manifest.json');
    if (fs.existsSync(path)) {
        response_json = JSON.parse(fs.readFileSync(path, 'utf8')) || '';
    }

    const cType = 'text/html; charset=utf-8;';
    res.setHeader('Content-Type', cType);
    res.end(JSON.stringify(response_json));
    return false;
}

function sw(req, res, next) {
    if (!req.url.includes('service-worker.js')) {
        next();
        return null;
    }
    res.writeHead(200, {'Service-Worker-Allowed':'/', 'Content-Type':'application/javascript'});
    console.log("%%%req.url", req.url);
    let response_sw;
    const path = join(__dirname, 'src/service-worker.js');
    console.log('###path :', path);
    if (fs.existsSync(path)) {
          response_sw =  fs.readFileSync(path, 'utf8') || '';       
    }
    res.end(response_sw);
    return false;
}

function wavesClientConfig(req, res, next) {
    if (!req.url.includes('waves-client-config')) {
        next();
        return null;
    }
    let response_json = { error: 'oops' };

    const path = join(__dirname, 'mocks/waves-client-config/master/config.json');
    if (fs.existsSync(path)) {
        response_json = JSON.parse(fs.readFileSync(path, 'utf8')) || '';
    }

    const cType = 'text/html; charset=utf-8;';
    res.setHeader('Content-Type', cType);
    res.end(JSON.stringify(response_json));
    return false;
}

function coinomat(req, res, next): boolean {
    const url = parse(req.url) as any;
    if (!url.href.includes('/coinomat/')) {
        next();
        return null;
    }
    let response_json = { error: 'oops' };
    const path = url.pathname.split('/').pop();
    const filename = `./mocks/coinomat/${path}.json`;

    if (fs.existsSync(filename)) {
        response_json = JSON.parse(fs.readFileSync(filename, 'utf8')) || '';
    }

    if (path === 'rate.php') {
        const data = qs.parse(url.query);
        response_json = (data.amount * 0.32258064) as any;
    }

    const cType = 'application/json; charset=utf-8;';
    res.setHeader('Content-Type', cType);
    res.end(JSON.stringify(response_json));
    return false;
}

interface IRequestData {
    platform: TPlatform;
    connection: TConnection;
    build: TBuild;
}
