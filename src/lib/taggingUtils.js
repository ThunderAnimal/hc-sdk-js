import stringUtils from './stringUtils';

const tagDelimiter = '=';

const taggingUtils = {

	generateTagsFromFhirObject(fhirObject) {
		const tagObject = {};
		if (fhirObject.resourceType) tagObject.resourceType = fhirObject.resourceType;

		return Object.keys(tagObject).map(tagKey =>
			this.buildTag(tagKey, tagObject[tagKey]));
	},

	buildTag(key, value) {
		return `${stringUtils.prepareForUpload(key)}`
		+ `${tagDelimiter}`
		+ `${stringUtils.prepareForUpload(value)}`;
	},
};

export default taggingUtils;
