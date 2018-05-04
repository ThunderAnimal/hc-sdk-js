if (typeof permissionsResultElement === 'undefined')
    var permissionsResultElement = document.getElementById('permissionsResult');

function grantPermission(appId) {
    GC.SDK.grantPermission(appId)
        .then((res) => {
            console.log(res)
            permissionsResultElement.innerText = `Successculffy granted permission to ${appId}.`;
        })
        .catch((error) => {
            console.log(error)
            permissionsResult.innerText = JSON.stringify(error);
        });
}

function getReceivedPermissions() {
    permissionsResultElement.innerText = '';
    GC.SDK.getReceivedPermissions()
        .then((receivedPermissions) => {
            receivedPermissions.forEach((receipient) => {
                let receipientElement = document.createElement('li');
                receipientElement.innerText = JSON.stringify(receipient);
                permissionsResultElement.appendChild(receipientElement);
            });
        });
}
