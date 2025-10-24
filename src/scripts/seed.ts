// @/scripts/seed.ts
import { collection, doc, setDoc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { specialties, studentUser, psychologistUser, adminUser, testSession } from '../lib/seed-data';

// --- HELPER FUNCTIONS ---

// Helper to clear a collection
async function clearCollection(collectionName: string) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        console.log(`Collection "${collectionName}" is already empty.`);
        return;
    }
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Successfully cleared collection: ${collectionName}`);
}

// Helper to create a user in Auth and Firestore
async function seedUser(auth: any, userData: any, password: any) {
    let user = null;
    try {
        console.log(`Attempting to create user: ${userData.email}`);
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        user = userCredential.user;
        console.log(`Successfully created user in Auth: ${userData.email}`);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log(`User ${userData.email} already exists in Auth. Skipping Auth creation, will ensure Firestore data is up-to-date.`);
        } else {
            console.error(`Critical error creating user ${userData.email} in Auth:`, error.message);
            throw error; // Throw to stop the script if a critical error occurs
        }
    }
    
    // Use the predefined UID for consistency, or the newly created one.
    const finalUid = user ? user.uid : userData.uid;
    const dataToSet = { ...userData, uid: finalUid };
    
    try {
        await setDoc(doc(db, 'users', finalUid), dataToSet);
        console.log(`Successfully set/updated user data in Firestore for: ${userData.email}`);
    } catch (firestoreError) {
        console.error(`Error writing user data to Firestore for ${userData.email}:`, firestoreError);
        throw firestoreError;
    }
}


// --- MAIN SEEDING LOGIC ---

async function seedSpecialties() {
  const specialtiesCollection = collection(db, 'courses'); // The collection is still named 'courses'
  console.log('Seeding specialties...');
  const batch = writeBatch(db);
  specialties.forEach(specialty => {
    const docRef = doc(specialtiesCollection); // Auto-generate ID
    batch.set(docRef, specialty);
  });
  await batch.commit();
  console.log('Successfully seeded specialties!');
}

async function seedUsers() {
    const auth = getAuth();
    console.log('Seeding users...');
    // Important: Use fixed passwords for test users for predictability
    await seedUser(auth, studentUser, 'password123');
    await seedUser(auth, psychologistUser, 'password123');
    await seedUser(auth, adminUser, 'admin');
    console.log('Successfully seeded users!');
}

async function seedSessions() {
    console.log('Seeding test session...');
    // Create one pending session for demonstration
    await setDoc(doc(collection(db, "sessions")), testSession);
    console.log('Successfully seeded test session!');
}


async function main() {
  console.log('--- Starting database seed process ---');

  // Clear existing data to ensure a clean slate
  await clearCollection('users');
  await clearCollection('sessions');
  await clearCollection('courses');
  
  // Seed new data
  await seedSpecialties();
  await seedUsers();
  await seedSessions();

  console.log('--------------------------------------');
  console.log('¡Proceso de siembra completado!');
  console.log('Por favor, reinicia tu servidor de desarrollo para ver los cambios.');
  console.log('Usuarios de prueba:');
  console.log(`- Administrador: ${adminUser.email} (password: admin)`);
  console.log(`- Estudiante: ${studentUser.email} (password: password123)`);
  console.log(`- Psicólogo: ${psychologistUser.email} (password: password123)`);
  console.log('--------------------------------------');
  process.exit(0);
}

main().catch((error) => {
  console.error('Se produjo un error durante el proceso de siembra:', error);
  process.exit(1);
});
