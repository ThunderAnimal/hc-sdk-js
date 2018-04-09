if (typeof resultElement === 'undefined')
    var resultElement = document.getElementById('result');

function cleanUp() {
    while (resultElement.firstChild) resultElement.removeChild(resultElement.firstChild);
}

function getDocuments() {
    cleanUp();
    HC.getDocuments(HC.getCurrentUser().id).then((hcDocuments) => {
        hcDocuments.records.forEach((hcDocument) => {
            let documentElement = document.createElement('div');
            documentElement.hcDocument = hcDocument
            documentElement.innerHTML = `${hcDocument.id}: ${hcDocument.title}`;
            resultElement.appendChild(documentElement);
        });
    });
}

function createUpdateForm(userId, hcDocument, display) {
    let updateForm = document.createElement('form');

    let titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = hcDocument.title;
    updateForm.appendChild(titleInput);

    let authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.value = hcDocument.author.firstName;
    updateForm.appendChild(authorInput);

    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    updateForm.appendChild(fileInput);

    let updateButton = document.createElement('button');
    updateButton.textContent = 'Press me to update this document.';
    updateButton.addEventListener('click', () => {
        hcDocument.title = titleInput.value;
        hcDocument.author.firstName = authorInput.value;
        hcDocument.attachments.push(
            ...[...fileInput.files].map(file => new HC.models.HCAttachment({ file })));
        HC.updateDocument(userId, hcDocument)
            .then(() => {
                display(hcDocument);
            });
    });
    updateForm.appendChild(updateButton);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Press me to delete this document.';
    deleteButton.addEventListener('click', () => {
        HC.deleteDocument(userId, hcDocument)
            .then(() => {
                resultElement.innerHTML =
                    `Document '${hcDocument.id}' has successfully been deleted.`;
            });
    });
    updateForm.appendChild(deleteButton);
    return updateForm;
}

function displayDocument(hcDocument) {
    cleanUp();

    let currentUserId = HC.getCurrentUser().id;
    resultElement.appendChild(createUpdateForm(currentUserId, hcDocument, displayDocument));

    hcDocument.attachments.forEach((attachment) => {
        let fileWrapper = document.createElement('div');

        let fileElement = document.createElement('embed');
        let reader = new FileReader();
        reader.addEventListener('load', (event) => {
            fileElement.setAttribute('src', event.target.result);
        });
        reader.readAsDataURL(attachment.file);
        fileWrapper.appendChild(fileElement);

        let fileTitle = document.createElement('div');
        fileTitle.innerHTML = attachment.title;
        fileWrapper.appendChild(fileTitle);

        let deleteFile = document.createElement('button');
        deleteFile.innerHTML = 'Press me to delete this file.';
        deleteFile.addEventListener('click', () => {
            hcDocument.attachments = hcDocument.attachments.filter(att => att.id === attachment.id);
            HC.updateDocument(currentUserId, hcDocument);
            resultElement.removeChild(fileWrapper);
        });
        fileWrapper.appendChild(deleteFile);

        resultElement.appendChild(fileWrapper);
    });
}

function getDocument(documentId) {
    HC.downloadDocument(HC.getCurrentUser().id, documentId)
        .then(displayDocument);
}

function uploadDocument(files, title, authorName) {
    let hcAuthor = new HC.models.HCAuthor({ firstName: authorName });
    let hcDocument = new HC.models.HCDocument({ files, title, author: hcAuthor });

    HC.uploadDocument(HC.getCurrentUser().id, hcDocument)
        .then(displayDocument);
}
