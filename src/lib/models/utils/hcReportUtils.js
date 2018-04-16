import Ajv from 'ajv';
import HCReport from '../HCReport';
import ValidationError from '../../errors/ValidationError';

const toId = ({ id }) => ({ id });
const toIdObject = id => ({ id });

const schema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        observations: { type: 'array' },
        labName: { type: 'string' },
    },
    required: ['observations'],
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

const hcReportUtils = {
    isValid(hcReport) {
        return validate(hcReport);
    },

    fromFhirObject(fhirObject) {
        if (fhirObject.resourceType !== 'DiagnosticReport') {
            throw new ValidationError(`Wrong model type: ${fhirObject.resourceType}`);
        }
        if (!fhirObject.result || !fhirObject.result.length) {
            throw new ValidationError('Missing expected data: result');
        }

        const [{ actor: { display: labName } = {} }] = fhirObject.performer || [];
        const { meta: { lastUpdated } = {} } = fhirObject;

        const hcReport = new HCReport({
            id: fhirObject.id,
            observations: fhirObject.result.map(toId),
            labName,
            issued: fhirObject.issued,
            lastUpdated,
        });

        return hcReport;
    },

    toFhirObject(hcReport) {
        const fhirObject = {
            id: hcReport.id,
            status: 'final',
            result: hcReport.observationsIds.map(toIdObject),
            issued: hcReport.issued,
            code: [{
                text: '-',
                coding: [{
                    display: '-',
                    code: '-',
                }],
            }],
            performer: [{
                actor: {
                    display: hcReport.labName,
                },
            }],
            meta: {
                lastUpdated: hcReport.lastUpdated,
            },
            resourceType: 'DiagnosticReport',
        };
        return fhirObject;
    },
};

export default hcReportUtils;
