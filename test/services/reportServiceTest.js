/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import 'babel-polyfill';
import chai from 'chai';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';
import sinonChai from 'sinon-chai';
import reportService from '../../src/services/reportService';
import hcReportUtils from '../../src/lib/models/utils/hcReportUtils';
import testVariables from '../../test/testUtils/testVariables';
import taggingUtils from '../../src/lib/taggingUtils';

sinonStubPromise(sinon);
chai.use(sinonChai);

const { expect } = chai;

describe('reportService', () => {
    let fromFhirObjectStub;
    let toFhirObjectStub;
    let isValidStub;

    let createFhirRecordStub;
    let downloadFhirRecordStub;
    let updateFhirRecordStub;
    let searchRecordsStub;

    const userId = 'user_id';
    const recordId = 'record_id';

    const hcReportIssuedDate = '2018-04-01T15:00:00';
    const hcReportLastUpdated = '2018-04-01T16:00:00';
    const hcReportLabName = 'testLabName';
    const observationId = 'observationId';

    const hcReport = {
        issued: hcReportIssuedDate,
        observations: [{ id: observationId }],
        labName: hcReportLabName,
        lastUpdated: hcReportLastUpdated,
    };

    const diagnosticReportFhir = {
        id: recordId,
        status: 'final',
        result: [{ id: observationId }],
        issued: new Date(hcReportIssuedDate),
        code: [{
            text: '-',
            coding: [{
                display: '-',
                code: '-',
            }],
        }],
        performer: [{
            actor: {
                display: hcReportLabName,
            },
        }],
        meta: {
            lastUpdated: new Date(hcReportLastUpdated),
        },
        resourceType: 'DiagnosticReport',
    };

    const diagnosticReportRecord = {
        record_id: recordId,
        date: '2017-09-19',
        user_id: userId,
        body: diagnosticReportFhir,
        tags: ['tag1', 'tag2'],
        version: 1,
        status: 'Active',
        createdAt: '2017-09-19T09:29:48.278',
    };

    const diagnosticReportTags = [taggingUtils.buildTag('resourceType', 'DiagnosticReport')];

    beforeEach(() => {
        fromFhirObjectStub = sinon.stub(hcReportUtils, 'fromFhirObject');
        toFhirObjectStub = sinon.stub(hcReportUtils, 'toFhirObject');
        isValidStub = sinon.stub(hcReportUtils, 'isValid').returns(true);

        createFhirRecordStub = sinon.stub()
            .returnsPromise().resolves(diagnosticReportRecord);
        downloadFhirRecordStub = sinon.stub()
            .returnsPromise().resolves(diagnosticReportRecord);
        searchRecordsStub = sinon.stub()
            .returnsPromise().withArgs(testVariables.userId, { tags: diagnosticReportTags })
            .resolves({
                totalCount: 1,
                records: [{
                    body: hcReport,
                    tags: diagnosticReportTags,
                    record_id: recordId,
                }],
            });

        reportService.fhirService = {
            createFhirRecord: createFhirRecordStub,
            downloadFhirRecord: downloadFhirRecordStub,
            updateFhirRecord: updateFhirRecordStub,
            searchRecords: searchRecordsStub,
        };
    });

    describe('downloadReport', () => {
        it('should invoke the fhirService', (done) => {
            reportService.downloadReport(userId, recordId)
                .then((R) => { // eslint-disable-line
                    expect(downloadFhirRecordStub).to.be.calledWith(userId, recordId);
                    expect(fromFhirObjectStub).to.be.calledWith(diagnosticReportRecord);
                    expect(R).to.be.defined;
                })
                .then(done.bind(null, null));
        });
    });

    describe('uploadReport', () => {
        it('should invoke the fhirService', (done) => {
            reportService.uploadReport(userId, hcReport)
                .then((R) => { // eslint-disable-line
                    expect(isValidStub).to.be.calledWith(hcReport);
                    expect(toFhirObjectStub).to.be.calledWith(hcReport);
                    expect(createFhirRecordStub).to.be.calledWith(userId);
                    expect(R).to.deep.equal({ id: recordId, ...hcReport });
                })
                .then(done.bind(null, null));
        });
    });

    describe('getReports', () => {
        it('should invoke the fhirService', (done) => {
            reportService.getReports(testVariables.userId)
                .then((result) => { // eslint-disable-line
                    expect(result.records[0]).to.have.property('id').equal(recordId);
                    expect(result.totalCount).to.equal(1);
                    expect(fromFhirObjectStub).to.be.calledOnce;
                })
                .catch(done)
                .then(done.bind(null, null));
        });
    });

    afterEach(() => {
        fromFhirObjectStub.restore();
        toFhirObjectStub.restore();
        isValidStub.restore();
    });
});
