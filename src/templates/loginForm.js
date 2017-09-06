const tagIds = {
	hcUsernameLogin: 'hcUsernameLogin',
	zkitLogin: 'zkitLogin',
};

const loginForm = document.createElement('form');
loginForm.innerHTML = `
  <input type="text" id="${tagIds.hcUsernameLogin}" placeholder="Nutzername">
  <div id="${tagIds.zkitLogin}"/></div>
  <button>Einloggen</button>
`;

export { tagIds };
export default loginForm;
