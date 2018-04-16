/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import HCReport from '../../../src/lib/models/HCReport';
import hcReportUtils from '../../../src/lib/models/utils/hcReportUtils';

chai.use(sinonChai);

const { expect } = chai;

describe('models/report', () => {
    const reportParameters = {
        id: 'someId',
        issued: new Date(),
        observations: [{ id: 'someObservationId' }],
        labName: 'someLabName',
    };

    beforeEach(() => {
    });

    it('constructor creates proper report', () => {
        const hcReport = new HCReport(reportParameters);
        expect(hcReport.id).to.equal(reportParameters.id);
        expect(hcReport.type).to.equal('Report');
        expect(hcReport.issued).to.equal(reportParameters.issued);
        expect(hcReport.observations).to.deep.equal(reportParameters.observations);
        expect(hcReport.labName).to.equal(reportParameters.labName);
    });

    it('converting a report to fhir and back doesn\'t'
        + ' change the report', () => {
        const hcReport = new HCReport(reportParameters);
        const fhirReport = hcReportUtils.toFhirObject(hcReport);
        const fhirGeneratedReport = hcReportUtils.fromFhirObject(fhirReport);
        expect(fhirGeneratedReport).to.deep.equal(hcReport);
    });

    it('constructed hcReport is accepted by validate', () => {
        const hcReport = new HCReport(reportParameters);
        expect(hcReportUtils.isValid(hcReport)).to.equal(true);
    });

    it('should throw if invalid resource type', () => {
        const notDiagnosticReport = {
            resourceType: 'NotDiagnosticReport',
        };
        expect(() => hcReportUtils.fromFhirObject(notDiagnosticReport)).to.throw();
    });

    it('should throw if observations is undefined', () => {
        const emptyDiagnosticReport = {
            resourceType: 'DiagnosticReport',
        };
        expect(() => hcReportUtils.fromFhirObject(emptyDiagnosticReport)).to.throw();
    });

    it('should throw if observations is empty', () => {
        const emptyDiagnosticReport = {
            resourceType: 'DiagnosticReport',
            observations: [],
        };
        expect(() => hcReportUtils.fromFhirObject(emptyDiagnosticReport)).to.throw();
    });

    it('should throw if issued is defined but not a Date', () => {
        const invalidDiagnosticReport = {
            resourceType: 'DiagnosticReport',
            observations: [{}],
            issued: 'aString',
        };
        expect(() => hcReportUtils.fromFhirObject(invalidDiagnosticReport)).to.throw();
    });
});
