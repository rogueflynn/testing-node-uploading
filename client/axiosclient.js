const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const { url } = require('./constants');
const makeRequest = async () => {
    try {
        const fileName = 'dummy.iso';
        const dir = __dirname;
        const file = `${dir}\\${fileName}`;
        const form = new FormData();
        const stats = fs.statSync(file)
        form.append('image', fs.createReadStream(file), fileName);
        const formHeaders = form.getHeaders();
        await axios({
            headers: {
                ...formHeaders,
                'Content-Length': stats.size,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            baseURL: url,
            url: '/isoupload',
            method: 'put',
            data: form,
            onUploadProgress: progress => {
                const { loaded, total } = progress
                const percentageProgress = Math.floor((loaded/total) * 100)
                console.log(`Progress: ${percentageProgress}`);
            },
        })
    } catch (error) {
        console.log(error.message);
    }
};

makeRequest();