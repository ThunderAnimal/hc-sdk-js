/* eslint-disable no-undef */
if (typeof loginResultElement === 'undefined')
    var loginResultElement = document.getElementById('loginResults');

async function login() {
    console.log('login started');
    const clientId = 'example';
    const CAP = await GC.SDK.createCAP();
    GC.AUTH.login(clientId, CAP);
}
