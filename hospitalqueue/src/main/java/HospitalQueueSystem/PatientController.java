
package HospitalQueueSystem;

import java.util.Comparator;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @PostMapping
    public Patient registerPatient(@RequestBody Patient patient) {

        List<Patient> patients = patientRepository.findAll();

        int maxQueueNumber = patients.stream()
                .filter(p -> patient.getDoctor() != null
                        && patient.getDoctor().equals(p.getDoctor())
                        && patient.getDepartment() != null
                        && patient.getDepartment().equals(p.getDepartment()))
                .map(Patient::getQueueNumber)
                .filter(number -> number != null)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);

        patient.setQueueNumber(maxQueueNumber + 1);
        patient.setStatus("WAITING");

        return patientRepository.save(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @PutMapping("/{id}/call")
    public Patient callPatient(@PathVariable Long id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found: " + id));

        if (!"WAITING".equals(patient.getStatus())) {
            throw new RuntimeException("Patient is not waiting.");
        }

        patient.setStatus("IN_CONSULTATION");

        return patientRepository.save(patient);
    }

    @PutMapping("/{id}/complete")
    public Patient completePatient(@PathVariable Long id) {

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found: " + id));

        if (!"IN_CONSULTATION".equals(patient.getStatus())) {
            throw new RuntimeException(
                    "Patient must be in consultation before completion.");
        }

        patient.setStatus("COMPLETED");

        return patientRepository.save(patient);
    }
}
