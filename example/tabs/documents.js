if (typeof resultElement === 'undefined')
    var resultElement = document.getElementById('result');

function cleanUp() {
    while (resultElement.firstChild) resultElement.removeChild(resultElement.firstChild);
}

function getDocuments() {
    cleanUp();
    GC.SDK.getDocuments(GC.SDK.getCurrentUserId()).then((hcDocuments) => {
        hcDocuments.records.forEach((hcDocument) => {
            let documentElement = document.createElement('div');
            documentElement.hcDocument = hcDocument
            documentElement.innerHTML = JSON.stringify(hcDocument, 2);
            resultElement.appendChild(documentElement);
        });
    });
}

function createUpdateForm(userId, hcDocument, display) {
    const updateForm = document.createElement('form');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = hcDocument.title;
    updateForm.appendChild(titleInput);

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.value = hcDocument.author.firstName;
    updateForm.appendChild(authorInput);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    updateForm.appendChild(fileInput);

    const annotationsInput = document.createElement('input');
    annotationsInput.type = 'text';
    annotationsInput.value = hcDocument.annotations.join(',');
    updateForm.appendChild(annotationsInput);

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Press me to update this document.';
    updateButton.addEventListener('click', () => {
        hcDocument.title = titleInput.value;
        hcDocument.author.firstName = authorInput.value;
        hcDocument.annotations = annotationsInput.value.split(',');
        hcDocument.attachments.push(
            ...[...fileInput.files].map(file => new GC.SDK.models.HCAttachment({ file })));
        GC.SDK.updateDocument(userId, hcDocument)
            .then(() => {
                display(hcDocument);
            });
    });
    updateForm.appendChild(updateButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Press me to delete this document.';
    deleteButton.addEventListener('click', () => {
        GC.SDK.deleteDocument(userId, hcDocument.id)
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
    const currentUserId = GC.SDK.getCurrentUserId();
    resultElement.appendChild(createUpdateForm(currentUserId, hcDocument, displayDocument));

    hcDocument.attachments.forEach((attachment) => {
        const fileWrapper = document.createElement('div');

        const fileElement = document.createElement('embed');
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            fileElement.setAttribute('src', event.target.result);
        });
        reader.readAsDataURL(attachment.file);
        fileWrapper.appendChild(fileElement);

        const fileTitle = document.createElement('div');
        fileTitle.innerHTML = attachment.title;
        fileWrapper.appendChild(fileTitle);

        const deleteFile = document.createElement('button');
        deleteFile.innerHTML = 'Press me to delete this file.';
        deleteFile.addEventListener('click', () => {
            hcDocument.attachments = hcDocument.attachments.filter(att => att.id === attachment.id);
            GC.SDK.updateDocument(currentUserId, hcDocument);
            resultElement.removeChild(fileWrapper);
        });
        fileWrapper.appendChild(deleteFile);

        resultElement.appendChild(fileWrapper);
    });
}

function getDocument(ownerId, documentId) {
    ownerId = ownerId || GC.SDK.getCurrentUserId();
    GC.SDK.downloadDocument(ownerId, documentId)
        .then(displayDocument);
}

function uploadDocument(files, title, authorName, annotations) {
    const hcAuthor = new GC.SDK.models.HCAuthor({ firstName: authorName });
    const hcDocument = new GC.SDK.models.HCDocument({
        files, title, author: hcAuthor, annotations: annotations.split(','),
    });

    GC.SDK.uploadDocument(GC.SDK.getCurrentUserId(), hcDocument)
        .then(displayDocument);
}
