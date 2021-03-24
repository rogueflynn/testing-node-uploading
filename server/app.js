// look in specified path for KUBE_TOKEN needed for k8s-api calls
// kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const Busboy = require('busboy');
const fs = require('fs');

const storage = multer.diskStorage(
    {
        destination: './',
        filename: function ( req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);

const upload = multer({ storage, });

// init express app and set static route before other middleware.
const app = express();
app.disable('x-powered-by');
const PORT = 1337;

let server;

// Avoids listening on specific port in testing environment. This is already handled by Supertests
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT);
    server.setTimeout(0);
}

app.set('io', io);
app.set('listeners', {});
app.set('appRoot', path.resolve(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//Upload route
app.put('/upload', upload.single('image'), (req, res, next) => {
    try {
        return res.status(201).json({
            message: 'File uploded successfully'
        });
    } catch (error) {
        console.error(error);
    }
});

app.put('/isoupload', function (req, res) {
    var busboy = new Busboy({ headers: req.headers });
    const message = "That's all folks!";
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join('.', filename);
        console.log('Uploading: ' + saveTo);
        file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
        console.log('Upload complete');
        console.log(`Received ${req.socket.bytesRead} bytes`);
        res.writeHead(200, { 'Connection': 'close' });
        res.end(message);
    });
    return req.pipe(busboy);
});

module.exports = app;
