// @/scripts/seed.ts
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { courses, tutors } from '../lib/seed-data';

async function seedCourses() {
  const coursesCollection = collection(db, 'courses');
  const snapshot = await getDocs(coursesCollection);
  if (!snapshot.empty) {
    console.log('La colección de cursos ya tiene datos. No se agregarán nuevos datos.');
    return;
  }

  console.log('Agregando cursos a la base de datos...');
  for (const course of courses) {
    try {
      await addDoc(coursesCollection, course);
    } catch (error) {
      console.error('Error al agregar el curso:', course.name, error);
    }
  }
  console.log('¡Cursos agregados exitosamente!');
}

async function seedTutors() {
  const tutorsCollection = collection(db, 'tutors');
    const snapshot = await getDocs(tutorsCollection);
  if (!snapshot.empty) {
    console.log('La colección de tutores ya tiene datos. No se agregarán nuevos datos.');
    return;
  }

  console.log('Agregando tutores a la base de datos...');
  for (const tutor of tutors) {
    try {
      await addDoc(tutorsCollection, tutor);
    } catch (error) {
      console.error('Error al agregar el tutor:', tutor.name, error);
    }
  }
  console.log('¡Tutores agregados exitosamente!');
}

async function main() {
  await seedCourses();
  await seedTutors();
  console.log('--------------------');
  console.log('¡Proceso de siembra completado!');
  console.log('Por favor, reinicia tu servidor de desarrollo para ver los cambios.');
  console.log('--------------------');
  process.exit(0);
}

main().catch((error) => {
  console.error('Se produjo un error durante el proceso de siembra:', error);
  process.exit(1);
});
