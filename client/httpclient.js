const FormData = require('form-data');
const { url } = require('./constants');
const fs = require('fs');
const URL = require('url').URL;

const fileName = 'catalina.iso';
const dir = __dirname;
const file = `${dir}\\${fileName}`;
const form = new FormData();
const stats = fs.statSync(file)
form.append('image', fs.createReadStream(file), fileName);
const formHeaders = form.getHeaders();
let loaded = 0;
const makeRequest = async (formData, options) => {
   const req = formData.submit(options, (err, res) => {
        if(err) {
            console.log(err.message);
            process.exit(1);
        }
        if (res.statusCode < 200 || res.statusCode > 299) {
            console.log(`status code: ${res.statusCode}`);
            process.exit(1);
        }
        const body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
            const buf = Buffer.concat(body);
            const resString = buf.toString();
            console.clear();
            console.log('Progress: 100%');
            console.log(resString);
            process.exit(0);
        })
   });

   req.on('drain', () => {
        loaded = req.socket.bytesWritten;
   });


   setInterval(() => {
        const percentageProgress = Math.floor((loaded/stats.size) * 100)
        if(percentageProgress <= 100) {
            console.clear();
            console.log(`Progress: ${percentageProgress}%`);
        } else {
            console.clear();
            console.log('Progress: 100%');
        }
   }, 3000)
}

const cachedURL = new URL(url);

const options = {
  host: cachedURL.hostname,
  port: cachedURL.port,
  path: '/isoupload',
  method: 'PUT',
  protocol: cachedURL.protocol,
  headers: {
    ...formHeaders,
    'Content-Length': stats.size
  },
}

makeRequest(form, options);
