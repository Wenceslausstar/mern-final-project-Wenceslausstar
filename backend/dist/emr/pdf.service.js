"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFKit = __importStar(require("pdfkit"));
let PdfService = class PdfService {
    async generatePrescriptionPdf(prescription) {
        return new Promise((resolve) => {
            const doc = new PDFKit();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.fontSize(20).text('PRESCRIPTION', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Prescription Number: ${prescription.prescriptionNumber}`);
            doc.text(`Issue Date: ${prescription.issueDate.toLocaleDateString()}`);
            if (prescription.expiryDate) {
                doc.text(`Expiry Date: ${prescription.expiryDate.toLocaleDateString()}`);
            }
            doc.moveDown();
            doc.fontSize(14).text('Patient Information:', { underline: true });
            doc.fontSize(12);
            doc.text(`Name: ${prescription.patientId['firstName']} ${prescription.patientId['lastName']}`);
            doc.text(`Email: ${prescription.patientId['email']}`);
            if (prescription.patientId['phoneNumber']) {
                doc.text(`Phone: ${prescription.patientId['phoneNumber']}`);
            }
            if (prescription.patientId['dateOfBirth']) {
                doc.text(`Date of Birth: ${new Date(prescription.patientId['dateOfBirth']).toLocaleDateString()}`);
            }
            doc.moveDown();
            doc.fontSize(14).text('Prescribed By:', { underline: true });
            doc.fontSize(12);
            doc.text(`Dr. ${prescription.doctorId['firstName']} ${prescription.doctorId['lastName']}`);
            doc.text(`Specialization: ${prescription.doctorId['specialization'] || 'N/A'}`);
            if (prescription.doctorId['licenseNumber']) {
                doc.text(`License Number: ${prescription.doctorId['licenseNumber']}`);
            }
            doc.moveDown();
            if (prescription.diagnosis) {
                doc.fontSize(14).text('Diagnosis:', { underline: true });
                doc.fontSize(12).text(prescription.diagnosis);
                doc.moveDown();
            }
            doc.fontSize(14).text('Medications:', { underline: true });
            doc.moveDown(0.5);
            prescription.medications.forEach((medication, index) => {
                doc.fontSize(12);
                doc.text(`${index + 1}. ${medication.medicationName}`);
                if (medication.genericName) {
                    doc.text(`   Generic: ${medication.genericName}`);
                }
                if (medication.strength) {
                    doc.text(`   Strength: ${medication.strength}`);
                }
                doc.text(`   Dosage: ${medication.dosage}`);
                doc.text(`   Frequency: ${medication.frequency}`);
                doc.text(`   Duration: ${medication.duration}`);
                doc.text(`   Quantity: ${medication.quantity}`);
                if (medication.instructions) {
                    doc.text(`   Instructions: ${medication.instructions}`);
                }
                if (medication.refills > 0) {
                    doc.text(`   Refills: ${medication.refills}`);
                }
                doc.moveDown();
            });
            if (prescription.notes) {
                doc.fontSize(14).text('Additional Notes:', { underline: true });
                doc.fontSize(12).text(prescription.notes);
                doc.moveDown();
            }
            if (prescription.allergies && prescription.allergies.length > 0) {
                doc.fontSize(14).text('Known Allergies:', { underline: true });
                doc.fontSize(12).text(prescription.allergies.join(', '));
                doc.moveDown();
            }
            if (prescription.pharmacy) {
                doc.fontSize(14).text('Pharmacy Information:', { underline: true });
                doc.fontSize(12);
                if (prescription.pharmacy.name) {
                    doc.text(`Name: ${prescription.pharmacy.name}`);
                }
                if (prescription.pharmacy.address) {
                    doc.text(`Address: ${prescription.pharmacy.address}`);
                }
                if (prescription.pharmacy.phone) {
                    doc.text(`Phone: ${prescription.pharmacy.phone}`);
                }
                doc.moveDown();
            }
            doc.moveDown(2);
            doc.fontSize(10);
            doc.text('This prescription is electronically generated and valid only when presented with proper identification.', { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, {
                align: 'center',
            });
            doc.moveDown(2);
            doc.text('_______________________________', { align: 'right' });
            doc.text("Doctor's Signature", { align: 'right' });
            doc.end();
        });
    }
    async generateMedicalRecordPdf(record) {
        return new Promise((resolve) => {
            const doc = new PDFKit();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.fontSize(20).text('MEDICAL RECORD', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Record Type: ${record.type.toUpperCase()}`);
            doc.text(`Date: ${record.createdAt.toLocaleDateString()}`);
            doc.moveDown();
            doc.fontSize(14).text('Patient Information:', { underline: true });
            doc.fontSize(12);
            doc.text(`Name: ${record.patientId.firstName} ${record.patientId.lastName}`);
            doc.text(`Email: ${record.patientId.email}`);
            doc.moveDown();
            doc.fontSize(14).text('Attending Physician:', { underline: true });
            doc.fontSize(12);
            doc.text(`Dr. ${record.doctorId.firstName} ${record.doctorId.lastName}`);
            doc.text(`Specialization: ${record.doctorId.specialization || 'N/A'}`);
            doc.moveDown();
            doc.fontSize(14).text('Medical Record Details:', { underline: true });
            doc.fontSize(12);
            if (record.title) {
                doc.text(`Title: ${record.title}`);
            }
            if (record.description) {
                doc.text(`Description: ${record.description}`);
            }
            if (record.symptoms && record.symptoms.length > 0) {
                doc.text(`Symptoms: ${record.symptoms.join(', ')}`);
            }
            if (record.diagnosis) {
                doc.text(`Diagnosis: ${record.diagnosis}`);
            }
            if (record.treatment) {
                doc.text(`Treatment: ${record.treatment}`);
            }
            if (record.vitalSigns) {
                doc.text('Vital Signs:');
                const vitals = record.vitalSigns;
                if (vitals.blood_pressure)
                    doc.text(`  Blood Pressure: ${vitals.blood_pressure}`);
                if (vitals.heart_rate)
                    doc.text(`  Heart Rate: ${vitals.heart_rate} bpm`);
                if (vitals.temperature)
                    doc.text(`  Temperature: ${vitals.temperature}°C`);
                if (vitals.weight)
                    doc.text(`  Weight: ${vitals.weight} kg`);
                if (vitals.height)
                    doc.text(`  Height: ${vitals.height} cm`);
                if (vitals.bmi)
                    doc.text(`  BMI: ${vitals.bmi}`);
                if (vitals.oxygen_saturation)
                    doc.text(`  Oxygen Saturation: ${vitals.oxygen_saturation}%`);
            }
            if (record.testResults) {
                doc.text('Test Results:');
                const tests = record.testResults;
                if (tests.testName)
                    doc.text(`  Test: ${tests.testName}`);
                if (tests.result)
                    doc.text(`  Result: ${tests.result}`);
                if (tests.normalRange)
                    doc.text(`  Normal Range: ${tests.normalRange}`);
                if (tests.unit)
                    doc.text(`  Unit: ${tests.unit}`);
            }
            if (record.notes) {
                doc.text(`Notes: ${record.notes}`);
            }
            doc.moveDown(2);
            doc.fontSize(10);
            doc.text('This medical record is electronically generated and confidential.', { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString()}`, {
                align: 'center',
            });
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map