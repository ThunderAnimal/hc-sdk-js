const tagIds = {
	hcUserRegister: 'hcUserRegister',
	zkitRegistration: 'zkitRegistration',
};

const createRegistrationFormTemplate = () => {
	const registrationForm = document.createElement('div');
	registrationForm.innerHTML = `
			<div class="row">
				<label>E-Mail-Adresse</label>
		    <input type="text" id="${tagIds.hcUserRegister}" placeholder="Email">
			</div>
			<div class="row">
				<label>Passwort</label>
		    <div id="${tagIds.zkitRegistration}"></div>
			</div>
	`;
	return registrationForm;
};


export { tagIds, createRegistrationFormTemplate };
