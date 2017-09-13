class Tags {
	constructor(tags) {
		this.tags = tags; // TODO tags need to come from backend while instantiating the class
	}
	createTagsFromFHIR(JsonFHIR) {
		const tags = [];
		if (JsonFHIR.resourceType) tags.push(JsonFHIR.resourceType);
		if (JsonFHIR.managingOrganization && JsonFHIR.managingOrganization.reference) {
			tags.push(JsonFHIR.managingOrganization.reference);
		}
		return tags;
	}
}

export default Tags;
