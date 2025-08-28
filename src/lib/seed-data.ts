// @/lib/seed-data.ts
import type { User, Course, Session } from './types';
import { Timestamp } from 'firebase/firestore';


// This data is for seeding the database for testing and demonstration purposes.

// --- TEST USERS ---
// Note: Passwords are not stored here. They should be manually created
// or handled via a secure admin process. For this script, we'll create them with fixed UIDs.

export const studentUser: Omit<User, 'id'> = {
  uid: 'student_test_uid',
  name: 'Usuario Anónimo',
  email: 'student.test@gmail.com',
  imageUrl: 'https://placehold.co/200x200/EBF4FF/76A9FA?text=A',
  isTutor: false,
};

export const psychologistUser: Omit<User, 'id'> = {
  uid: 'psychologist_test_uid',
  name: 'Dra. Ana Molina',
  email: 'psyc.test@gmail.com',
  imageUrl: 'https://placehold.co/400x400/d1d4f7/434b8c?text=AP',
  isTutor: true,
  rating: 4.9,
  reviews: 150,
  hourlyRate: 45000,
  courses: ['Psicología Clínica', 'Terapia Cognitivo-Conductual (TCC)', 'Trastornos de Ansiedad'],
  bio: 'Psicóloga clínica con más de 15 años de experiencia. Me especializo en terapia cognitivo-conductual para tratar la ansiedad, la depresión y el estrés. Mi enfoque es colaborativo y centrado en soluciones.'
};

// --- SPECIALTIES (formerly Courses) ---
export const specialties: Omit<Course, 'id'>[] = [
  { name: 'Psicología Clínica' },
  { name: 'Terapia Cognitivo-Conductual (TCC)' },
  { name: 'Psicoanálisis' },
  { name: 'Psicología Humanista' },
  { name: 'Terapia de Pareja y Familia' },
  { name: 'Psicología Infantil y del Adolescente' },
  { name: 'Neuropsicología' },
  { name: 'Psicología Organizacional' },
  { name: 'Psicología del Deporte' },
  { name: 'Mindfulness y Bienestar' },
  { name: 'Trastornos de Ansiedad' },
  { name: 'Depresión y Trastornos del Ánimo' },
  { name: 'Adicciones' },
  { name: 'Trastornos de la Conducta Alimentaria' },
  { name: 'Psicogerontología' },
];

// --- TEST SESSION ---
// A pending session from the test student to the test psychologist
export const testSession: Omit<Session, 'id'> = {
    studentId: studentUser.uid,
    tutorId: psychologistUser.uid,
    status: 'pending',
    course: 'Trastornos de Ansiedad',
    // Denormalized data for easy display
    student: {
        name: studentUser.name,
        imageUrl: studentUser.imageUrl,
    },
    tutor: {
        name: psychologistUser.name,
        imageUrl: psychologistUser.imageUrl,
    },
    createdAt: Timestamp.now(),
}
