import HCAttachment from './HCAttachment';
import ValidationError from '../errors/ValidationError';

class HCDocument {
    constructor({
        files = [],
        type = 'Document',
        title,
        creationDate = new Date(),
        author,
        additionalIds,
        annotations,
        id,
    } = {}) {
        if (!(Array.isArray(files)
                && (!additionalIds || typeof additionalIds === 'object')
                && typeof type === 'string'
                && (!annotations || typeof annotations === 'object')
                && typeof title === 'string'
                && creationDate instanceof Date
                && (!author || typeof author === 'object'))) {
            throw new ValidationError('HCDocument: Invalid arguments');
        }
        this.attachments = files.map(file => new HCAttachment({ file }));
        this.type = type;
        this.creationDate = creationDate;
        this.title = title;
        this.author = author;
        this.additionalIds = additionalIds;
        this.id = id;
        this.annotations = annotations;
    }
}

export default HCDocument;
