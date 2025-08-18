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
  const usersCollection = collection(db, 'users');
  // Note: This is a simple check. A more robust check would query for any user with isTutor:true.
  const snapshot = await getDocs(usersCollection); 
  if (snapshot.docs.some(doc => doc.data().isTutor)) {
    console.log('La colección de usuarios ya tiene tutores. No se agregarán nuevos datos.');
    return;
  }

  console.log('Agregando tutores a la colección de usuarios...');
  for (const tutor of tutors) {
    try {
      await addDoc(usersCollection, tutor);
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
