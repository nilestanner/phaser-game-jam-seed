var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: './dist/**', // use the glob format
    platforms: ['win32', 'win64'],
    appName: 'PhaserGameJamSeed',
    buildType: 'versioned',
    zip: true,
});

// Log stuff you want
nw.on('log',  console.log);

nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});