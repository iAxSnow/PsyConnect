import type { Tutor, Course, Session, User } from './types';

export const courses: Course[] = [
  { id: 'cbi1421', name: 'Cálculo I' },
  { id: 'cbi1422', name: 'Cálculo II' },
  { id: 'cbi1411', name: 'Álgebra y Geometría' },
  { id: 'cbi1412', name: 'Álgebra Lineal' },
  { id: 'fic1002', name: 'Programación' },
  { id: 'fic1003', name: 'Estructuras de Datos' },
  { id: 'cbi1211', name: 'Mecánica' },
  { id: 'cbi1212', name: 'Electricidad y Magnetismo' },
  { id: 'udp0101', name: 'Química General' },
];

export const defaultUser: User = {
  id: 'user1',
  name: 'Estudiante de Prueba',
  email: 'student.test@mail.udp.cl',
  imageUrl: 'https://placehold.co/200x200.png'
};

export const tutors: Tutor[] = [
  {
    id: '1',
    name: 'Ana García',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    reviews: 120,
    hourlyRate: 25,
    courses: ['Programación', 'Cálculo II'],
    bio: 'Desarrolladora full-stack con experiencia y pasión por la enseñanza. Me especializo en desglosar conceptos de programación complejos en lecciones fáciles de entender. Mi objetivo es ayudarte no solo a aprobar, sino a sobresalir.'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    reviews: 95,
    hourlyRate: 30,
    courses: ['Mecánica', 'Cálculo II'],
    bio: 'Ingeniero mecánico con amor por la física. Creo en los ejemplos prácticos y la resolución de problemas para construir una base sólida en física y matemáticas avanzadas.'
  },
  {
    id: '3',
    name: 'Sofía Martínez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 5.0,
    reviews: 200,
    hourlyRate: 28,
    courses: ['Química General', 'Cálculo I'],
    bio: 'Doctora en Química. Disfruto ayudando a los estudiantes a navegar los desafíos de la química y a comprender los principios que dan forma a nuestro mundo.'
  },
  {
    id: '4',
    name: 'Javier Hernández',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.7,
    reviews: 75,
    hourlyRate: 22,
    courses: ['Álgebra y Geometría', 'Álgebra Lineal'],
    bio: 'Un graduado con un gran interés en el álgebra. Ofrezco explicaciones claras y concisas y aplicaciones del mundo real para que el aprendizaje sea atractivo y eficaz.'
  },
  {
    id: 'default-tutor',
    name: 'Tutor de Prueba',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.5,
    reviews: 50,
    hourlyRate: 20,
    courses: ['Programación', 'Mecánica'],
    bio: 'Este es un tutor de prueba para fines de desarrollo y demostración.'
  }
];

export const sessions: Session[] = [
  {
    id: 's1',
    tutor: { name: 'Ana García', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Programación',
    date: '2024-08-15',
    time: '14:00',
    status: 'scheduled'
  },
  {
    id: 's2',
    tutor: { name: 'Carlos Rodríguez', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Mecánica',
    date: '2024-08-16',
    time: '10:00',
    status: 'scheduled'
  },
  {
    id: 's3',
    tutor: { name: 'Sofía Martínez', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Química General',
    date: '2024-07-20',
    time: '16:00',
    status: 'completed'
  },
    {
    id: 's4',
    tutor: { name: 'Javier Hernández', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Álgebra y Geometría',
    date: '2024-07-18',
    time: '11:00',
    status: 'completed'
  },
   {
    id: 's5',
    tutor: { name: 'Ana García', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Cálculo II',
    date: '2024-06-10',
    time: '13:00',
    status: 'completed'
  },
];
