import { ensureDateIfExists, ensureArrayIfExists } from '../validationUtils';

const withId = ({ id }) => id !== undefined;
const flatId = ({ id }) => id;

class HCReport {
    constructor({
        id,
        issued,
        observations,
        labName,
        lastUpdated,
    } = {}) {
        this.id = id;
        this.issued = ensureDateIfExists(issued, 'issued');
        this.observations = ensureArrayIfExists(observations) || [];
        this.observationsIds = observations.filter(withId).map(flatId);
        this.labName = labName;
        this.lastUpdated = ensureDateIfExists(lastUpdated, 'lastUpdated') || new Date();
        this.type = 'Report';
    }
}

export default HCReport;
