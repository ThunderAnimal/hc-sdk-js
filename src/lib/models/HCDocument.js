import HCAttachment from './HCAttachment';
import ValidationError from '../errors/ValidationError';

class HCDocument {
    constructor({
        files = [],
        type = 'Document',
        title,
        creationDate = new Date(),
        author,
        id,
    } = {}) {
        if (!(Array.isArray(files)
                && typeof type === 'string'
                && typeof title === 'string'
                && creationDate instanceof Date
                && typeof author === 'string')) {
            throw new ValidationError('HCDocument: Invalid arguments');
        }
        this.attachments = files.map(file => new HCAttachment({ file }));
        this.type = type;
        this.creationDate = creationDate;
        this.title = title;
        this.author = author;
        this.id = id;
    }
}

export default HCDocument;
