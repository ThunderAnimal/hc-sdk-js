/* eslint-disable no-undef */
if (typeof loginResultElement === 'undefined')
    var loginResultElement = document.getElementById('loginResults');

async function login() {
    console.log('login started');
    let clientId = 'example';
    let CAP = await HC.healthCloud.createCAP();
    HC.authCloud.login(clientId, CAP);
};