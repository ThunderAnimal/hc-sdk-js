import fhirService from './fhirService';
import taggingUtils, { tagKeys } from '../lib/taggingUtils';
import hcReportUtils from '../lib/models/utils/hcReportUtils';
import ValidationError from '../lib/errors/ValidationError';

const reportTags = [taggingUtils.buildTag('resourceType', 'DiagnosticReport')];

const reportService = {
    fhirService,

    downloadReport(ownerId, reportId) {
        return this.fhirService.downloadFhirRecord(ownerId, reportId)
            .then(hcReportUtils.fromFhirObject);
    },

    uploadReport(ownerId, hcReport) {
        if (!hcReportUtils.isValid(hcReport)) {
            return Promise.reject(new ValidationError('Not a valid hcReport'));
        }
        const fhirObject = hcReportUtils.toFhirObject(hcReport);

        return this.fhirService.createFhirRecord(ownerId, fhirObject)
            .then(record => ({ id: record.record_id, ...hcReport }));
    },

    deleteReport(ownerId, hcReport) {
        return this.fhirService.deleteRecord(ownerId, hcReport.id);
    },

    getReports(ownerId, params = {}) {
        return this.fhirService.searchRecords(ownerId, { tags: reportTags, ...params })
            .then(result => ({
                ...result,
                // eslint-disable-next-line
                records: result.records.map(({ body, tags, record_id }) => ({
                    ...hcReportUtils.fromFhirObject(body),
                    client: taggingUtils.getTagValueFromList(tags, tagKeys.client),
                    id: record_id, // eslint-disable-line camelcase
                })),
            }));
    },

    getReportsCount(ownerId, params = {}) {
        return this.fhirService.searchRecords(ownerId, { tags: reportTags, ...params }, true);
    },
};

export default reportService;
