const tagIds = {
	hcUsernameRegister: 'hcUsernameRegister',
	zkitRegistration: 'zkitRegistration',
};

const registrationForm = document.createElement('form');
registrationForm.innerHTML = `
  <input type="text" id="${tagIds.hcUsernameRegister}" placeholder="Nutzername">
  <div id="${tagIds.zkitRegistration}"></div>
  <button>Registrieren</button>
`;

export { tagIds };
export default registrationForm;
