// @/scripts/seed.ts
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, app as clientApp } from '../lib/firebase'; // Renamed to avoid conflict
import { specialties, studentUser, psychologistUser, approvedPsychologistUser, testSession } from '../lib/seed-data';
import * as admin from 'firebase-admin';

// --- INITIALIZE ADMIN SDK ---
// This is crucial for managing users programmatically.

// Ensure you have the service account key file (don't commit it to git!)
// For this environment, we can use application default credentials.
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'))
  : undefined;

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
        projectId: 'profe-udp-connect',
    });
}

// --- HELPER FUNCTIONS ---

// Helper to clear test users from Firebase Authentication
async function clearAuthUsers(uids: string[]) {
    try {
        await admin.auth().deleteUsers(uids);
        console.log('Successfully deleted test users from Firebase Auth.');
    } catch (error: any) {
        if (error.code === 'not-found') {
            console.log('No test users found in Firebase Auth to delete.');
        } else if (error.code === 'auth/user-not-found') {
            console.warn('One or more test users were not found in Auth for deletion, which is okay.');
        } else {
            console.error('Error deleting users from auth:', error.message);
        }
    }
}

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
            console.warn(`WARNING: User ${userData.email} already exists in Firebase Auth. This should not happen after clearing auth users.`);
        } else {
            console.error(`\nCRITICAL ERROR creating user ${userData.email} in Auth:`, error.message);
            console.error('The script will stop to prevent inconsistent data.\n');
            throw error; // Stop the script
        }
    }
    
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
  const specialtiesCollection = collection(db, 'courses');
  console.log('Seeding specialties...');
  const batch = writeBatch(db);
  specialties.forEach(specialty => {
    const docRef = doc(specialtiesCollection);
    batch.set(docRef, specialty);
  });
  await batch.commit();
  console.log('Successfully seeded specialties!');
}

async function seedUsers() {
    const auth = getAuth(clientApp);
    const testPassword = 'password123456'; 
    console.log('Seeding users...');
    
    try {
        await seedUser(auth, studentUser, testPassword);
        await seedUser(auth, psychologistUser, testPassword);
        await seedUser(auth, approvedPsychologistUser, testPassword);
        console.log('Successfully seeded users!');
    } catch (error) {
        console.error("\n--- A critical error occurred during user seeding. ---");
        throw error;
    }
}

async function seedSessions() {
    console.log('Seeding test session...');
    await setDoc(doc(collection(db, "sessions")), testSession);
    console.log('Successfully seeded test session!');
}


async function main() {
  console.log('--- Starting database seed process ---');
  const testPassword = 'password123456';
  const testUserUids = [studentUser.uid, psychologistUser.uid, approvedPsychologistUser.uid];

  try {
    // 1. Clear Auth users first to prevent "ghost" data
    console.log('Clearing old test users from Firebase Auth...');
    await clearAuthUsers(testUserUids);

    // 2. Clear Firestore collections
    console.log('Clearing Firestore collections...');
    await Promise.all([
        clearCollection('users'),
        clearCollection('sessions'),
        clearCollection('courses'),
    ]);
    console.log('Firestore collections cleared.');
  
    // 3. Seed new data
    await seedSpecialties();
    await seedUsers();
    await seedSessions();

    console.log('--------------------------------------');
    console.log('¡Proceso de siembra completado!');
    console.log('\nUsuarios de prueba creados:');
    console.log(`- Estudiante: ${studentUser.email} (password: ${testPassword})`);
    console.log(`- Psicólogo por validar: ${psychologistUser.email} (password: ${testPassword})`);
    console.log(`- Psicólogo aprobado: ${approvedPsychologistUser.email} (password: ${testPassword})`);
    console.log('--------------------------------------');
    process.exit(0);

  } catch (error) {
    console.error('\nSe produjo un error durante el proceso de siembra. El script se ha detenido.');
    process.exit(1);
  }
}

main();
