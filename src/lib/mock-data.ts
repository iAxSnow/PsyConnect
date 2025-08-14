import type { Tutor, Course, Session } from './types';

export const courses: Course[] = [
  { id: 'cs101', name: 'Introduction to Computer Science' },
  { id: 'ma202', name: 'Calculus II' },
  { id: 'ph105', name: 'Physics for Engineers' },
  { id: 'ch201', name: 'Organic Chemistry' },
  { id: 'ec101', name: 'Principles of Microeconomics' },
  { id: 'py101', name: 'Introduction to Psychology' },
];

export const tutors: Tutor[] = [
  {
    id: '1',
    name: 'Ana García',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.9,
    reviews: 120,
    hourlyRate: 25,
    courses: ['Introduction to Computer Science', 'Calculus II'],
    bio: 'Experienced full-stack developer with a passion for teaching. I specialize in breaking down complex programming concepts into easy-to-understand lessons. My goal is to help you not just pass, but excel.'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    reviews: 95,
    hourlyRate: 30,
    courses: ['Physics for Engineers', 'Calculus II'],
    bio: 'Mechanical engineer with a love for physics. I believe in hands-on examples and practical problem-solving to build a strong foundation in physics and advanced mathematics.'
  },
  {
    id: '3',
    name: 'Sofia Martinez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 5.0,
    reviews: 200,
    hourlyRate: 28,
    courses: ['Organic Chemistry', 'Principles of Microeconomics'],
    bio: 'PhD in Chemistry with a minor in Economics. I enjoy helping students navigate the challenges of organic chemistry and understand the economic principles that shape our world.'
  },
  {
    id: '4',
    name: 'Javier Hernandez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.7,
    reviews: 75,
    hourlyRate: 22,
    courses: ['Introduction to Psychology', 'Principles of Microeconomics'],
    bio: 'A psychology graduate with a keen interest in behavioral economics. I provide clear, concise explanations and real-world applications to make learning engaging and effective.'
  },
];

export const sessions: Session[] = [
  {
    id: 's1',
    tutor: { name: 'Ana García', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Introduction to Computer Science',
    date: '2024-08-15',
    time: '14:00',
    status: 'scheduled'
  },
  {
    id: 's2',
    tutor: { name: 'Carlos Rodríguez', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Physics for Engineers',
    date: '2024-08-16',
    time: '10:00',
    status: 'scheduled'
  },
  {
    id: 's3',
    tutor: { name: 'Sofia Martinez', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Organic Chemistry',
    date: '2024-07-20',
    time: '16:00',
    status: 'completed'
  },
    {
    id: 's4',
    tutor: { name: 'Javier Hernandez', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Introduction to Psychology',
    date: '2024-07-18',
    time: '11:00',
    status: 'completed'
  },
   {
    id: 's5',
    tutor: { name: 'Ana García', imageUrl: 'https://placehold.co/100x100.png' },
    course: 'Calculus II',
    date: '2024-06-10',
    time: '13:00',
    status: 'completed'
  },
];
