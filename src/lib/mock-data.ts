import type { Tutor, Course, Session, User } from './types';

export const courses: Course[] = [
  // Ingeniería Civil en Informática y Telecomunicaciones
  { id: 'inf-alg-geo', name: 'Álgebra y Geometría' },
  { id: 'inf-calc-i', name: 'Cálculo I' },
  { id: 'inf-prog', name: 'Programación' },
  { id: 'inf-quim', name: 'Química' },
  { id: 'inf-com-ing', name: 'Comunicación para la Ingeniería' },
  { id: 'inf-alg-lin', name: 'Álgebra Lineal' },
  { id: 'inf-calc-ii', name: 'Cálculo II' },
  { id: 'inf-mec', name: 'Mecánica' },
  { id: 'inf-prog-av', name: 'Programación Avanzada' },
  { id: 'inf-ecu-dif', name: 'Ecuaciones Diferenciales' },
  { id: 'inf-calc-iii', name: 'Cálculo III' },
  { id: 'inf-cal-ond', name: 'Calor y Ondas' },
  { id: 'inf-est-dat', name: 'Estructura de Datos y Algoritmos' },
  { id: 'inf-prob-est', name: 'Probabilidades y Estadísticas' },
  { id: 'inf-ele-mag', name: 'Electricidad y Magnetismo' },
  { id: 'inf-ele-elect', name: 'Electrónica y Electrotecnia' },
  { id: 'inf-bdd', name: 'Bases de Datos' },
  { id: 'inf-des-web', name: 'Desarrollo Web y Móvil' },
  { id: 'inf-opt', name: 'Optimización' },
  { id: 'inf-sen-sis', name: 'Señales y Sistemas' },
  { id: 'inf-arq-comp', name: 'Arquitectura y Organización de Computadores' },
  { id: 'inf-bdd-av', name: 'Bases de Datos Avanzadas' },
  { id: 'inf-red-dat', name: 'Redes de Datos' },
  { id: 'inf-sis-op', name: 'Sistemas Operativos' },
  { id: 'inf-ing-soft', name: 'Ingeniería de Software' },
  { id: 'inf-conta-cost', name: 'Contabilidad y Costos' },
  { id: 'inf-ges-org', name: 'Gestión Organizacional' },
  { id: 'inf-tal-red', name: 'Taller de Redes y Servicios' },
  { id: 'inf-com-dig', name: 'Comunicaciones Digitales' },
  { id: 'inf-ia', name: 'Inteligencia Artificial' },
  { id: 'inf-intro-eco', name: 'Introducción a la Economía' },
  { id: 'inf-sis-dist', name: 'Sistemas Distribuidos' },
  { id: 'inf-cripto', name: 'Criptografía y Seguridad en Redes' },
  { id: 'inf-arq-soft', name: 'Arquitectura de Software' },
  { id: 'inf-data-sci', name: 'Data Science' },
  { id: 'inf-eval-proy-tic', name: 'Evaluación de Proyectos TIC' },
  { id: 'inf-tec-inal', name: 'Tecnologías Inalámbricas' },
  { id: 'inf-proy-tic-i', name: 'Proyectos en TICs I' },
  { id: 'inf-arq-emerg', name: 'Arquitecturas Emergentes' },
  { id: 'inf-proy-tic-ii', name: 'Proyectos en TICs II' },

  // Ingeniería Civil Industrial
  { id: 'ind-term', name: 'Termodinámica' },
  { id: 'ind-micro', name: 'Microeconomía' },
  { id: 'ind-inf-est', name: 'Inferencia Estadística' },
  { id: 'ind-mec-fluid', name: 'Mecánica de Fluidos' },
  { id: 'ind-macro', name: 'Macroeconomía' },
  { id: 'ind-inv-op', name: 'Investigación de Operaciones' },
  { id: 'ind-fin', name: 'Finanzas' },
  { id: 'ind-lid-emp', name: 'Liderazgo y Emprendimiento' },
  { id: 'ind-sim', name: 'Simulación' },
  { id: 'ind-ges-op', name: 'Gestión de Operaciones' },
  { id: 'ind-ing-eco', name: 'Ingeniería Económica' },
  { id: 'ind-mkt', name: 'Marketing' },
  { id: 'ind-log', name: 'Logística' },
  { id: 'ind-ges-cal', name: 'Gestión de Calidad y Procesos' },
  { id: 'ind-ges-est', name: 'Gestión Estratégica' },
  { id: 'ind-eval-proy', name: 'Evaluación de Proyectos' },
  { id: 'ind-tal-ind', name: 'Taller de Ingeniería Industrial' },
  
  // Ingeniería Civil en Obras Civiles
  { id: 'oc-ing-mat', name: 'Ingeniería de Materiales' },
  { id: 'oc-est', name: 'Estática' },
  { id: 'oc-mec-sol', name: 'Mecánica de Sólidos' },
  { id: 'oc-topo', name: 'Topografía' },
  { id: 'oc-edif', name: 'Edificación' },
  { id: 'oc-an-est', name: 'Análisis Estructural' },
  { id: 'oc-mec-sue', name: 'Mecánica de Suelos' },
  { id: 'oc-tec-hor', name: 'Tecnología del Hormigón' },
  { id: 'oc-hidro', name: 'Hidrología' },
  { id: 'oc-dis-est', name: 'Diseño Estructural' },
  { id: 'oc-ing-cost', name: 'Ingeniería de Costos' },
  { id: 'oc-bim', name: 'BIM (Building Information Modeling)' },
  { id: 'oc-hid', name: 'Hidráulica' },
  { id: 'oc-dis-hor', name: 'Diseño en Hormigón' },
  { id: 'oc-ing-fund', name: 'Ingeniería de Fundaciones' },
  { id: 'oc-ing-amb', name: 'Ingeniería Ambiental' },
  { id: 'oc-dis-ace', name: 'Diseño en Acero' },
  { id: 'oc-hid-urb', name: 'Hidráulica Urbana' },
  { id: 'oc-plan-proy', name: 'Planificación de Proyectos' },
  { id: 'oc-dis-cam', name: 'Diseño de Caminos' },
  { id: 'oc-tal-proy', name: 'Taller de Proyectos' },
  { id: 'oc-ing-sis', name: 'Ingeniería Sísmica' },
  
  // Cursos de Formación General y Electivos
  { id: 'cfg', name: 'Curso de Formación General' },
  { id: 'ing-gen-i', name: 'Inglés General I' },
  { id: 'ing-gen-ii', name: 'Inglés General II' },
  { id: 'ing-gen-iii', name: 'Inglés General III' },
  { id: 'pract-prof-i', name: 'Práctica Profesional I' },
  { id: 'pract-prof-ii', name: 'Práctica Profesional II' },
  { id: 'elec-prof', name: 'Electivo Profesional' },
  { id: 'act-tit', name: 'Actividad de Titulación' },
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
    hourlyRate: 15000,
    courses: ['Programación', 'Cálculo II'],
    bio: 'Desarrolladora full-stack con experiencia y pasión por la enseñanza. Me especializo en desglosar conceptos de programación complejos en lecciones fáciles de entender. Mi objetivo es ayudarte no solo a aprobar, sino a sobresalir.'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.8,
    reviews: 95,
    hourlyRate: 18000,
    courses: ['Mecánica', 'Cálculo II'],
    bio: 'Ingeniero mecánico con amor por la física. Creo en los ejemplos prácticos y la resolución de problemas para construir una base sólida en física y matemáticas avanzadas.'
  },
  {
    id: '3',
    name: 'Sofía Martínez',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 5.0,
    reviews: 200,
    hourlyRate: 17000,
    courses: ['Química', 'Cálculo I'],
    bio: 'Doctora en Química. Disfruto ayudando a los estudiantes a navegar los desafíos de la química y a comprender los principios que dan forma a nuestro mundo.'
  },
  {
    id: '4',
    name: 'Javier Hernández',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.7,
    reviews: 75,
    hourlyRate: 14000,
    courses: ['Álgebra y Geometría', 'Álgebra Lineal'],
    bio: 'Un graduado con un gran interés en el álgebra. Ofrezco explicaciones claras y concisas y aplicaciones del mundo real para que el aprendizaje sea atractivo y eficaz.'
  },
  {
    id: 'default-tutor',
    name: 'Tutor de Prueba',
    imageUrl: 'https://placehold.co/400x400.png',
    rating: 4.5,
    reviews: 50,
    hourlyRate: 10000,
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
    course: 'Química',
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
