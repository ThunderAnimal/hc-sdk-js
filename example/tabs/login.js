/* eslint-disable no-undef */
if (typeof loginResultElement === 'undefined')
    var loginResultElement = document.getElementById('loginResults');

async function login() {
    console.log('login started');
    const clientId = 'example';
    GC.SDK.createCAP().then((CAP) => {
        GC.AUTH.login(clientId, CAP);
    });
}
