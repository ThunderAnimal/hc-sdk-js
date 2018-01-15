/* eslint-disable no-undef */
if (typeof registerResultElement === 'undefined')
    var registerResultElement = document.getElementById('registerResults');

HC.getRegistrationForm(document.getElementById('gesundheits_register'));
document.getElementById('submitRegister').addEventListener('click', () => {
    HC.register()
        .then((success) => {
            registerResultElement.innerHTML = `Successfully registered: ${JSON.stringify(success)}`;
        })
        .catch((error) => {
            registerResultElement.innerHTML = `An error occurred: ${JSON.stringify(error)}`;
        });
});
