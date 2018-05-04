import stringUtils from './stringUtils';

const TAG_DELIMITER = '=';

const ANNOTATION_LABEL = 'custom';

export const tagKeys = {
    client: 'client',
    resourceType: 'resourceType',
};

const taggingUtils = {
    generateTags(fhirObject) {
        const tagObject = {};
        if (this.clientId) tagObject.clientId = this.clientId;
        if (fhirObject.resourceType) tagObject.resourceType = fhirObject.resourceType;

        return Object.keys(tagObject).map(tagKey =>
            this.buildTag(tagKey, tagObject[tagKey]));
    },

    generateCustomTags(annotationList) {
        return annotationList.map(el => this.buildTag(ANNOTATION_LABEL, el));
    },

    buildTag(key, value) {
        return `${stringUtils.prepareForUpload(key)}`
        + `${TAG_DELIMITER}`
        + `${stringUtils.prepareForUpload(value)}`;
    },

    getTagValueFromList(tagList, tagKey) {
        const clientTag = tagList.find(el => el.includes(`${tagKey}${TAG_DELIMITER}`));
        return clientTag ? this.getValue(clientTag) : undefined;
    },

    getValue(tag) {
        return tag.split(TAG_DELIMITER)[1];
    },

    getAnnotations(tagList) {
        return tagList.reduce((annotations, el) => {
            if (el.includes(`${ANNOTATION_LABEL}${TAG_DELIMITER}`)) {
                annotations.push(this.getValue(el));
            }
            return annotations;
        }, []);
    },
};

export default taggingUtils;
