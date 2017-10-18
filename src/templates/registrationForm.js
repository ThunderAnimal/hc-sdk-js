const tagIds = {
	hcUserRegister: 'hcUserRegister',
	zkitRegistration: 'zkitRegistration',
};

const registrationForm = document.createElement('form');
registrationForm.innerHTML = `
  <input type="text" id="${tagIds.hcUserRegister}" placeholder="Email">
  <div id="${tagIds.zkitRegistration}"></div>
  <button>Registrieren</button>
`;

export { tagIds };
export default registrationForm;
