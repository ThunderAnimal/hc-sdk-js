/* eslint-disable no-undef */
if (typeof loginResultElement === 'undefined') {
    var loginResultElement = document.getElementById('loginResults');
}

$('#gcLoginBtn').click(() => {
    // login, if there is no token
    GC.AUTH.loggedIn.then(has => !has && GC.AUTH.login());
});
