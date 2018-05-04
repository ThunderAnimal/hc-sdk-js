/* eslint-disable no-undef */
if (typeof registerResultElement === 'undefined')
    var registerResultElement = document.getElementById('registerResults');

function register() {
    console.log('register on gesundheitscloud.com');
    window.open('http://localhost:8080/register');
}
