/* eslint-disable radix */
const Specialty = {
    394539006: 'Pediatric surgery',
    394576009: 'Surgical-Accident & emergency',
    394577000: 'Anesthetics',
    394578005: 'Audiological medicine',
    394579002: 'Cardiology',
    394580004: 'Clinical genetics',
    394581000: 'Community medicine',
    394582007: 'Dermatology',
    394583002: 'Endocrinology',
    394584008: 'Gastroenterology',
    394585009: 'Obstetrics and gynecology',
    394586005: 'Gynecology',
    394587001: 'Psychiatry',
    394588006: 'Pediatric (Child and adolescent) psychiatry',
    394589003: 'Nephrology',
    394590007: 'Thoracic medicine',
    394591006: 'Neurology',
    394592004: 'Clinical oncology',
    394593009: 'Medical oncology',
    394594003: 'Ophthalmology',
    394597005: 'Histopathology',
    394598000: 'Immunopathology',
    394599008: 'Neuropathology',
    394600006: 'Clinical pharmacology',
    394601005: 'Clinical physiology',
    394602003: 'Rehabilitation',
    394604002: 'Surgery-Ear, nose and throat surgery',
    394605001: 'Surgery-Dental-Oral surgery',
    394606000: 'Surgery-Dentistry-Restorative dentistry',
    394607009: 'Pediatric dentistry',
    394608004: 'Surgery-Dentistry-surgical-Orthodontics',
    394609007: 'Surgery-general',
    394610002: 'Surgery-Neurosurgery',
    394611003: 'Surgery-Plastic surgery',
    394612005: 'Urology',
    394649004: 'Nuclear medicine',
    394732004: 'Surgical specialty--OTHER-NOT LISTED',
    394733009: 'Medical specialty--OTHER--NOT LISTED',
    394801008: 'Surgery-Trauma and orthopedics',
    394802001: 'General medicine',
    394803006: 'Clinical hematology',
    394804000: 'Clinical cytogenetics and molecular genetics',
    394806003: 'Palliative medicine',
    394807007: 'Infectious diseases',
    394808002: 'Genito-urinary medicine',
    394809005: 'Clinical neuro-physiology',
    394810000: 'Rheumatology',
    394811001: 'Geriatric medicine',
    394812008: 'Dental medicine specialties',
    394813003: 'Medical ophthalmology',
    394814009: 'General practice',
    394821009: 'Occupational medicine',
    394882004: 'Pain management',
    394913002: 'Psychotherapy',
    394914008: 'Radiology',
    394915009: 'General pathology',
    394916005: 'Hematopathology',
    408440000: 'Public health medicine',
    408441001: 'Surgery-Dental-Endodontics',
    408443003: 'General medical practice',
    408444009: 'Dental-General dental practice',
    408446006: 'Gynecological oncology',
    408447002: 'Respite care',
    408448007: 'Tropical medicine',
    408449004: 'Surgery-Dentistry--surgical',
    408450004: 'Sleep studies',
    408454008: 'Clinical microbiology',
    408455009: 'Radiology-Interventional radiology ',
    408459003: 'Pediatric cardiology',
    408460008: 'Surgery-Dental-surgical-Prosthodontics',
    408461007: 'Surgery-Dental-Periodontal surgery',
    408462000: 'Burns care',
    408463005: 'Surgery-Vascular',
    408464004: 'Surgery-Colorectal surgery',
    408465003: 'Surgery-Dental-Oral and maxillofacial surgery',
    408466002: 'Surgery-Cardiac surgery',
    408467006: 'Adult mental illness',
    408468001: 'Learning disability',
    408469009: 'Surgery-Breast surgery',
    408470005: 'Obstetrics',
    408471009: 'Surgery-Cardiothoracic transplantation',
    408472002: 'Hepatology',
    408474001: 'Surgery-Hepatobiliary and pancreatic surgery',
    408475000: 'Diabetic medicine',
    408476004: 'Surgery-Bone and marrow transplantation',
    408477008: 'Surgery-Transplantation surgery',
    408478003: 'Critical care medicine',
    408480009: 'Clinical immunology',
    409967009: 'Toxicology ',
    409968004: 'Preventive medicine',
    410001006: 'Military medicine',
    410005002: 'Dive medicine',
    416304004: 'Osteopathic manipulative medicine',
    418002000: 'Pediatric oncology',
    418018006: 'Surgery-Dermatologic surgery',
    418058008: 'Pediatric gastroenterology',
    418112009: 'Pulmonary medicine',
    418535003: 'Pediatric immunology',
    418652005: 'Pediatric hematology',
    418862001: 'Pediatric infectious diseases',
    418960008: 'Otolaryngology',
    419043006: 'Urological oncology',
    419170002: 'Pediatric pulmonology',
    419192003: 'Internal medicine',
    419321007: 'Surgical oncology',
    419365004: 'Pediatric nephrology',
    419472004: 'Pediatric rheumatology',
    419610006: 'Pediatric endocrinology',
    419772000: 'Family practice',
    419815003: 'Radiation oncology',
    419983000: 'Pediatric ophthalmology',
    420112009: 'Pediatric surgery-bone marrow transplantation',
    420208008: 'Pediatric genetics',
    421661004: 'Blood banking and transfusion medicine',
    422191005: 'Ophthalmic surgery',
};

const hcSpecialtyUtils = {
    display(int) {
        return Specialty[int];
    },
    getSpecialties() {
        return Object.keys(Specialty);
    },

    // Specialty is not resourceType in FHIR but is often used as codeable concept
    // We use it to define the practice setting in which document was created
    // Speciality in our model is a single value.So the coding array always has one
    // value.
    fromFhirCodeableConcept(fhirCodeableConcept) {
        return fhirCodeableConcept.coding && fhirCodeableConcept.coding[0]
            && fhirCodeableConcept.coding[0].code;
    },

    toFhirCodeableConcept(specialty) {
        return {
            coding: [{
                display: this.display(specialty),
                code: specialty,
            }],
        };
    },

};

export default hcSpecialtyUtils;
