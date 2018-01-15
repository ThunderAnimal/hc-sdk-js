const tagIds = {
    hcUserLogin: 'hcUserLogin',
    zkitLogin: 'zkitLogin',
    submitBtn: 'submitBtn',
};

const createLoginFormTemplate = () => {
    const loginForm = document.createElement('form');
    loginForm.innerHTML = `
            <div class="row">
                <label>E-Mail-Adresse</label>
                <input type="text" id="${tagIds.hcUserLogin}">
            </div>
            <div class="row">
                <label>Passwort</label>
              <div id="${tagIds.zkitLogin}"/></div>
            </div>
            <div class="row">
            <button id="${tagIds.submitBtn}">ANMELDEN</button>
            </div>
    `;
    return loginForm;
};


export { tagIds, createLoginFormTemplate };
