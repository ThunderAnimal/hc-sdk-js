import ValidationError from "../errors/ValidationError";

class HCAttachment {
  constructor({ file, title, type, creationDate, id }) {
    if (
      !(
        (file instanceof File || !file) &&
        (typeof title === "string" || !title) &&
        (typeof type === "string" || !type) &&
        (creationDate instanceof Date || !creationDate) &&
        (typeof id === "string" || !id)
      )
    ) {
      throw new ValidationError("HCAttachment: Invalid arguments");
    }
    this.file = file;
    this.title = title || (file ? file.name : undefined);
    this.type = type || (file ? file.type : undefined);
    this.creationDate =
      creationDate || (file ? file.lastModifiedDate : undefined);
    this.id = id;
  }

  static fromFhirObject(fhirObject) {
    const attachment = new HCAttachment({
      title: fhirObject.title,
      type: fhirObject.contentType,
      creationDate: new Date(fhirObject.creation)
    });
    attachment.id = fhirObject.id;
    return attachment;
  }

  toFhirObject() {
    return {
      id: this.id,
      title: this.title,
      contentType: this.type,
      creation: this.creationDate.toISOString()
    };
  }
}

export default HCAttachment;
