const si = require('systeminformation');

const AsyncPolling = require('async-polling');

const CLI = require('clui');
const clc = require('cli-color');
const Line = CLI.Line;
const LineBuffer = CLI.LineBuffer;

const Gauge = CLI.Gauge;

function getMemLine(outputBuffer) {
    return new Promise((resolve, reject) => {
        si.mem().then(data => {
            let memTotal = data.total;
            let memFree = data.free;
            let memUsed = memTotal - memFree;
            let memHuman = Math.ceil(memUsed / 1000000) + ' MB';

            resolve(new Line(outputBuffer)
                .column('Memory In Use', 20, [clc.cyan])
                .column(Gauge(memUsed, memTotal, 20, memTotal * 0.8, memHuman), 30)
                .fill().store());
        });
    });
}

function getCurrLoadLine(outputBuffer) {
    return new Promise((resolve, reject) => {
        si.currentLoad().then(data => {
            let currLoad = data.currentload;
            let cpuHuman = Math.ceil(currLoad).toFixed(0) + '%';

            resolve(new Line(outputBuffer)
                .column('Current CPU Load', 20, [clc.cyan])
                .column(Gauge(currLoad, 100, 20, 80, cpuHuman), 30)
                .fill().store());
        });
    });
}

function getFSSizeLine(outputBuffer) {
    return new Promise((resolve, reject) => {
        si.fsSize().then((data, err) => {
            if (err) {
                console.log('There was a problem...');
                console.log(err);
                return;
            }

            let lines = [];

            for (let x = 0; x < data.length; x++) {
                let fsHuman = Math.ceil(data[x].use).toFixed(0) + '%';
                lines += new Line(outputBuffer)
                    .column('Drive ' + data[x].fs.toString(), 20, [clc.cyan])
                    .column(Gauge(data[x].use, 100, 20, 80, fsHuman), 30)
                    .fill().store()
            }

            resolve(lines);
        });
    });
}

async function getLatestData(outputBuffer) {
    const memLine = await getMemLine(outputBuffer);
    const cpuLine = await getCurrLoadLine(outputBuffer);
    const fsSizeLines = await getFSSizeLine(outputBuffer);
}

let pollRate = 5000;

if (!isNaN(process.argv[2])) {
    pollRate = process.argv[2];
}

AsyncPolling(end => {
    const outputBuffer = new LineBuffer({
        x: 0,
        y: 0,
        width: 'console',
        height: 'console'
    });

    getLatestData(outputBuffer).then(() => {
        console.log('\x1Bc');
        outputBuffer.output();
        end();
    });
}, pollRate).run();