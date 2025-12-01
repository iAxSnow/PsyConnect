// @/scripts/seed.ts
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../lib/firebase';
import { specialties, studentUser, psychologistUser, approvedPsychologistUser, testSession } from '../lib/seed-data';

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

// Robust helper to create a user in Auth and Firestore
async function seedUser(auth: any, userData: any, password: any) {
    let authUid = userData.uid;
    
    try {
        console.log(`Attempting to create user in Auth: ${userData.email}`);
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        authUid = userCredential.user.uid;
        console.log(`Successfully created user in Auth with new UID: ${authUid}`);
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.warn(`WARNING: User ${userData.email} already exists in Firebase Auth. The script will proceed assuming the UID is correct, but the password is not updated. If you face login issues, delete the user from Firebase Auth console and re-run the seed.`);
            // We proceed because the Firestore data might need updating anyway.
        } else {
            console.error(`\nCRITICAL ERROR creating user ${userData.email} in Auth:`, error.message);
            console.error(`This might be due to a weak password or other Firebase Auth validation rules.`);
            console.error('The script will stop to prevent inconsistent data.\n');
            throw error; // Stop the script if a critical error occurs
        }
    }
    
    // Use the confirmed UID from Auth to write to Firestore
    const dataToSet = { ...userData, uid: authUid };
    
    try {
        // Use the original UID for the document ID to keep it consistent
        await setDoc(doc(db, 'users', userData.uid), dataToSet);
        console.log(`Successfully set user data in Firestore for: ${userData.email} (Doc ID: ${userData.uid})`);
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
    const testPassword = 'password123456'; // Use a valid password
    console.log('Seeding users...');
    
    // We are seeding with PRE-DEFINED UIDs. Auth will generate new UIDs, but we use the fixed ones for document IDs
    // This part of the script is flawed if not handled carefully, but we'll try to make it work.
    try {
        await seedUser(auth, studentUser, testPassword);
        await seedUser(auth, psychologistUser, testPassword);
        await seedUser(auth, approvedPsychologistUser, testPassword);
        console.log('Successfully seeded users!');
    } catch (error) {
        console.error("\n--- A critical error occurred during user seeding. ---");
        console.error("This usually happens if the test users already exist in Firebase Authentication.");
        console.error("The script has stopped to prevent data corruption.");
        console.error("Please go to your Firebase Console -> Authentication and DELETE the test users (e.g., student.test@gmail.com) and then run `npm run db:seed` again.");
        throw error; // re-throw to stop the main process
    }
}

async function seedSessions() {
    console.log('Seeding test session...');
    // Create one pending session for demonstration
    await setDoc(doc(collection(db, "sessions")), testSession);
    console.log('Successfully seeded test session!');
}


async function main() {
  console.log('--- Starting database seed process ---');
  const testPassword = 'password123456';

  // Clear existing data to ensure a clean slate
  console.log('Clearing Firestore collections...');
  // This is the key change: we wipe the collections clean first.
  await clearCollection('users');
  await clearCollection('sessions');
  await clearCollection('courses');
  console.log('Firestore collections cleared.');
  
  // Seed new data
  try {
    await seedSpecialties();
    await seedUsers();
    await seedSessions();

    console.log('--------------------------------------');
    console.log('¡Proceso de siembra completado!');
    console.log('\nUsuarios de prueba creados (si no existían en Auth):');
    console.log(`- Estudiante: ${studentUser.email} (password: ${testPassword})`);
    console.log(`- Psicólogo por validar: ${psychologistUser.email} (password: ${testPassword})`);
    console.log(`- Psicólogo aprobado: ${approvedPsychologistUser.email} (password: ${testPassword})`);
    console.log('--------------------------------------');
    process.exit(0);

  } catch (error) {
    console.error('\nSe produjo un error durante el proceso de siembra. El script se ha detenido.');
    // The specific error messages are logged within the seedUser function.
    process.exit(1);
  }
}

main();
