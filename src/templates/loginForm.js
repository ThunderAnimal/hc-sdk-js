const tagIds = {
	hcUserLogin: 'hcUserLogin',
	zkitLogin: 'zkitLogin',
};

const loginForm = document.createElement('form');
loginForm.innerHTML = `
  <input type="text" id="${tagIds.hcUserLogin}" placeholder="Email">
  <div id="${tagIds.zkitLogin}"/></div>
  <button>Einloggen</button>
`;

export { tagIds };
export default loginForm;
