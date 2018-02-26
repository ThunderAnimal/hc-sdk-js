import stringUtils from './stringUtils';

const TAG_DELIMITER = '=';

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
};

export default taggingUtils;
