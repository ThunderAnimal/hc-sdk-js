/* eslint-disable no-undef */
if (typeof loginResultElement === "undefined")
  var loginResultElement = document.getElementById("loginResults");

HC.getLoginForm(document.getElementById("gesundheitsLogin"))
  .then(success => {
    loginResultElement.innerHTML = `Successfully logged in: ${JSON.stringify(
      success
    )}`;
  })
  .catch(error => {
    loginResultElement.innerHTML = `An error occurred: ${JSON.stringify(
      error
    )}`;
  });
