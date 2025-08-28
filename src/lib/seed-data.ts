import type { User, Course } from './types';

// Especialidades de Psicología
export const courses: Omit<Course, 'id'>[] = [
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


export const tutors: Omit<User, 'id' | 'uid'>[] = [
  {
    name: 'Dr. Alejandro Vargas',
    email: 'alejandro.vargas@psyconnect.cl',
    imageUrl: 'https://placehold.co/200x200.png',
    isTutor: true, // This marks the user as a psychologist
    rating: 4.9,
    reviews: 150,
    hourlyRate: 45000,
    courses: ['Psicología Clínica', 'Terapia Cognitivo-Conductual (TCC)', 'Trastornos de Ansiedad'],
    bio: 'Psicólogo clínico con más de 15 años de experiencia. Me especializo en terapia cognitivo-conductual para tratar la ansiedad, la depresión y el estrés. Mi enfoque es colaborativo y centrado en soluciones.'
  },
  {
    name: 'Dra. Isabela Reyes',
    email: 'isabela.reyes@psyconnect.cl',
    imageUrl: 'https://placehold.co/200x200.png',
    isTutor: true,
    rating: 5.0,
    reviews: 210,
    hourlyRate: 50000,
    courses: ['Terapia de Pareja y Familia', 'Psicología Humanista'],
    bio: 'Terapeuta familiar y de pareja con un enfoque sistémico y humanista. Ayudo a las personas a mejorar sus relaciones y a encontrar un mayor bienestar a través de la comunicación y la empatía.'
  },
  {
    name: 'Lic. Matías Castro',
    email: 'matias.castro@psyconnect.cl',
    imageUrl: 'https://placehold.co/200x200.png',
    isTutor: true,
    rating: 4.8,
    reviews: 90,
    hourlyRate: 35000,
    courses: ['Psicología Infantil y del Adolescente', 'Mindfulness y Bienestar'],
    bio: 'Psicólogo especializado en el trabajo con niños y adolescentes. Utilizo técnicas basadas en el juego y el mindfulness para abordar desafíos emocionales y conductuales en un entorno seguro y de confianza.'
  },
  {
    name: 'Lic. Valentina Torres',
    email: 'valentina.torres@psyconnect.cl',
    imageUrl: 'https://placehold.co/200x200.png',
    isTutor: true,
    rating: 4.9,
    reviews: 125,
    hourlyRate: 40000,
    courses: ['Neuropsicología', 'Depresión y Trastornos del Ánimo'],
    bio: 'Neuropsicóloga apasionada por la relación entre el cerebro y la conducta. Ofrezco evaluación y rehabilitación neurocognitiva para adultos, y terapia de apoyo para trastornos del ánimo.'
  }
];
