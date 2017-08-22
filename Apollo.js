const si = require('systeminformation');

const AsyncPolling = require('async-polling');

const CLI = require('clui');
const clc = require('cli-color');
const Line = CLI.Line;
const LineBuffer = CLI.LineBuffer;

const Gauge = CLI.Gauge;

AsyncPolling(end => {
    const outputBuffer = new LineBuffer({
        x: 0,
        y: 0,
        width: 'console',
        height: 'console'
    });

    si.mem().then(data => {
        let memTotal = data.total;
        let memFree = data.free;
        let memUsed = memTotal - memFree;
        let memHuman = Math.ceil(memUsed / 1000000) + ' MB';

        new Line(outputBuffer)
            .column('Memory In Use', 20, [clc.cyan])
            .column(Gauge(memUsed, memTotal, 20, memTotal * 0.8, memHuman), 30)
            .fill().store();

        si.currentLoad().then(data => {
            let currLoad = data.currentload;
            let cpuHuman = Math.ceil(currLoad).toFixed(0) + '%';

            new Line(outputBuffer)
                .column('Current CPU Load', 20, [clc.cyan])
                .column(Gauge(currLoad, 100, 20, 80, cpuHuman), 30)
                .fill().store();

            outputBuffer.output();
            end();
        });
    });
}, 5000).run();