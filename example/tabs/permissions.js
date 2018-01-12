if (typeof grantResultElement === 'undefined')
	var grantResultElement = document.getElementById('grantResult');
if (typeof grantedPermissionsElement === 'undefined')
	var grantedPermissionsElement = document.getElementById('grantedPermissions');

function grantPermissions(granteeAlias) {
	HC.grantPermission(granteeAlias)
		.then(() => HC.getUserIdByAlias(granteeAlias))
		.then((id) => {
			let granteeElement = document.createElement('li');
			granteeElement.innerText = id;
			grantedPermissionsElement.appendChild(granteeElement);
		})
		.catch((error) => {
			grantResultElement.innerHTML = JSON.stringify(error);
		});
}

function getGrantedPermissions() {
	HC.getGrantedPermissions()
		.then((grantedPermissions) => {
			grantedPermissions.forEach((grantee) => {
				let granteeElement = document.createElement('li');
				granteeElement.innerText = grantee.granteeId;
				console.log(grantee);
				grantedPermissionsElement.appendChild(granteeElement);
			});
		})
		.catch(console.log);
}

getGrantedPermissions();