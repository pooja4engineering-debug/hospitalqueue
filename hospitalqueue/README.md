# CareQueue — Hospital Queue Management System

CareQueue is a hospital queue management application designed to help receptionists register patients, manage consultation queues, and monitor patient waiting times through a simple dashboard.

## Features

- **Patient Registration:** Register patients with their name, age, phone number, department, and doctor.
- **Queue Management:** Automatically assign queue numbers based on doctor and department.
- **Patient Status Tracking:** Track patients as Waiting, In Consultation, or Completed.
- **Receptionist Dashboard:** View patient records and queue statistics.
- **Search and Filtering:** Find patients by name, phone number, doctor, department, or status.
- **Estimated Waiting Time:** Display estimated waiting times for patients in the queue.
- **CSV Export:** Export filtered patient queue records to a CSV file.

## Technologies Used

- Java 21
- Spring Boot
- Spring Data JPA
- MySQL
- HTML
- CSS
- JavaScript
- Maven
- Git and GitHub

## Prerequisites

- Java Development Kit (JDK) 21
- MySQL Server
- Maven, or the Maven Wrapper included with the project
- An IDE such as Visual Studio Code

## Local Setup

1. Clone or download this repository.
2. Create a MySQL database named `hospital_queue_db`.
3. Configure the database connection using local environment variables:
   - `DB_URL`: `jdbc:mysql://localhost:3306/hospital_queue_db`
   - `DB_USERNAME`: your MySQL username
   - `DB_PASSWORD`: your MySQL password
4. Ensure the local `src/main/resources/application.properties` file contains the required Spring Boot configuration. Do not commit database credentials to GitHub.
5. Open the project in your IDE and run the main Spring Boot application class, `HospitalqueueApplication`.
6. Open your browser and visit `http://localhost:8080/`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/patients` | Register a patient |
| GET | `/api/patients` | Retrieve patient records |
| PUT | `/api/patients/{id}/call` | Call a waiting patient |
| PUT | `/api/patients/{id}/complete` | Mark a consultation as completed |

## Project Status

The application is developed for learning and demonstration purposes. It currently runs locally and has not been deployed as a public live application.

## Security Note

Do not store database passwords, private credentials, or real patient information in the public repository. Use test data for demonstrations.

## Author

Developed as a full-stack project to practise backend development, database integration, REST APIs, and frontend development.