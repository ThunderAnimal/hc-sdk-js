/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import "babel-polyfill";
import chai from "chai";
import sinon from "sinon";
import sinonStubPromise from "sinon-stub-promise";
import sinonChai from "sinon-chai";
import proxy from "proxyquireify";
import "../../src/routes/fileRoutes";

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe("fileRoutes", () => {
  let requestStub;
  let fileRoutes;

  beforeEach(() => {
    requestStub = sinon.stub().returnsPromise();
  });

  it("downloadFile passes", done => {
    fileRoutes = proxyquire("../../src/routes/fileRoutes", {
      "../lib/hcRequest": { default: requestStub.resolves("pass") }
    }).default;

    fileRoutes.downloadFile("fakeSasUrl", "fakeDocumentBlob").then(res => {
      expect(res).to.equal("pass");
      expect(requestStub).to.be.calledOnce;
      expect(requestStub).to.be.calledWith("GET");
      done();
    });
    requestStub.reset();
  });

  it("uploadFile passes", done => {
    fileRoutes = proxyquire("../../src/routes/fileRoutes", {
      "../lib/hcRequest": { default: requestStub.resolves("pass") }
    }).default;

    fileRoutes.uploadFile("fakeSasUrl", "fakeDocumentBlob").then(res => {
      expect(res).to.equal("pass");
      expect(requestStub).to.be.calledOnce;
      expect(requestStub).to.be.calledWith("PUT");
      done();
    });
    requestStub.reset();
  });

  it("uploadFile returns error if hcRequest returns error", done => {
    fileRoutes = proxyquire("../../src/routes/fileRoutes", {
      "../lib/hcRequest": { default: requestStub.rejects("error") }
    }).default;

    fileRoutes.uploadFile("fakeSasUrl", "fakeDocumentBlob").catch(res => {
      expect(res).to.equal("error");
      expect(requestStub).to.be.calledOnce;
      expect(requestStub).to.be.calledWith("PUT");
      done();
    });
    requestStub.reset();
  });
});
