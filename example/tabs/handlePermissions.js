function grantPermissions(granteeAlias) {
	let permissionsResultElement = document.getElementById('permissionsResult');
	HC.grantPermission(granteeAlias)
		.then((result) => {
			permissionsResultElement.innerHTML = JSON.stringify(result, null, 2);
			permissionsResultElement.classList.remove('hidden');
		});
}