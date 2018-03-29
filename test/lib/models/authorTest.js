/* eslint-disable no-new */
/* eslint-env mocha */
import 'babel-polyfill';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import HCAuthor from '../../../src/lib/models/HCAuthor';
import documentResources from '../../testUtils/documentResources';

chai.use(sinonChai);

const { expect } = chai;

describe('models/author', () => {
    it('creates a proper author object on passing correct values', () => {
        const hcAuthor = new HCAuthor(documentResources.author);
        expect(hcAuthor.toString()).to.equal(documentResources.author.toString());
    });

    it('throws an error when invalid arguments are passed', () => {
        const author = Object.assign({}, documentResources.author);
        author.specialty = 'invalid';
        try {
            new HCAuthor(author);
        } catch (error) {
            expect(error.name).to.equal('ValidationError');
        }
    });
});
