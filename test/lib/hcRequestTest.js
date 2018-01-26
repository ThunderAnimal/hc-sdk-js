/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
import "babel-polyfill";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import sinonStubPromise from "sinon-stub-promise";
import proxy from "proxyquireify";
import "../../src/lib/hcRequest";

const proxyquire = proxy(require);

sinonStubPromise(sinon);
chai.use(sinonChai);

const expect = chai.expect;

describe("hcRequest", () => {
  let requestSetStub;
  let requestSendStub;
  let requestResponseTypeStub;
  let requestQueryStub;
  let requestStub;
  let hcRequest;

  beforeEach(() => {
    requestSendStub = sinon.stub().returnsPromise();

    requestResponseTypeStub = sinon.stub().returns({
      send: requestSendStub
    });

    requestQueryStub = sinon.stub().returns({
      responseType: requestResponseTypeStub
    });

    requestSetStub = sinon.stub().returns({
      query: requestQueryStub
    });

    requestStub = sinon.stub().returns({
      set: requestSetStub
    });

    hcRequest = proxyquire("../../src/lib/hcRequest", {
      "superagent-bluebird-promise": requestStub
    }).default;
  });

  it("should pass when api sends successful response", done => {
    requestSendStub.resolves({ ok: true, body: { status: "201" } });

    hcRequest("POST", "path")
      .then(res => {
        expect(res.status).to.equal("201");
        expect(requestStub).to.be.calledWith("POST");
        expect(requestSendStub.firstCall.args[0]).to.be.undefined;
        expect(requestStub).to.be.calledOnce;
        done();
      })
      .catch(done);
  });

  it("should pass when api sends successful response", done => {
    requestSendStub.resolves({
      ok: true,
      body: { status: "201" },
      headers: { "x-total-count": 1 }
    });

    hcRequest("GET", "path", { includeResponseHeaders: true })
      .then(res => {
        expect(res.body.status).to.equal("201");
        expect(requestStub).to.be.calledOnce;
        done();
      })
      .catch(done);
  });

  it("should send refresh request when api sends 401 unauthorised", done => {
    requestSendStub.onCall(0).rejects({
      status: 401,
      body: { error: "Your Authorization Token has expired" }
    });
    requestSendStub.onCall(1).resolves({ ok: true, body: { status: "201" } });

    const getRefreshTokenStub = sinon
      .stub()
      .returnsPromise()
      .resolves({
        access_token: "fakeAccessToken",
        refresh_token: "fakeRefreshToken"
      });
    const getAccessTokkenStub = sinon.stub().returns("token");

    hcRequest = proxyquire("../../src/lib/hcRequest", {
      "./sessionHandler/web": {
        default: {
          getItem: getAccessTokkenStub,
          setItem: sinon.stub().returns(true)
        }
      },
      "../routes/authRoutes": {
        default: { getRefreshTokenFromCode: getRefreshTokenStub }
      },
      "superagent-bluebird-promise": requestStub
    }).default;

    hcRequest("POST", "/users/fakeUserId/documents/fakeDocumentId", {
      authorize: true
    })
      .then(res => {
        expect(res.status).to.equal("201");
        expect(getRefreshTokenStub).to.be.calledOnce;
        expect(getAccessTokkenStub).to.be.calledThrice;
        done();
      })
      .catch(done);
  });

  afterEach(() => {
    requestSetStub.reset();
    requestSendStub.reset();
    requestQueryStub.reset();
    requestResponseTypeStub.reset();
    requestStub.reset();
  });
});
