// @/scripts/seed.ts
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { specialties, studentUser, psychologistUser, approvedPsychologistUser, testSession } from '../lib/seed-data';
import * as admin from 'firebase-admin';

// --- INITIALIZE ADMIN SDK ---
// This is crucial for managing users programmatically.

// Ensure you have the service account key file (don't commit it to git!)
// For this environment, we can use application default credentials if the key isn't explicitly set.
if (admin.apps.length === 0) {
    let credential;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
            const serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'));
            credential = admin.credential.cert(serviceAccount);
        } catch (e) {
            console.warn("Could not parse GOOGLE_APPLICATION_CREDENTIALS, falling back to application default. Error:", e);
            credential = admin.credential.applicationDefault();
        }
    } else {
        console.log("GOOGLE_APPLICATION_CREDENTIALS not found, using application default credentials.");
        credential = admin.credential.applicationDefault();
    }
    
    admin.initializeApp({
        credential,
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
        // It's okay if users are not found, it just means they were already deleted.
        if (error.code === 'auth/user-not-found' || error.message.includes("Some users not found")) {
            console.log('One or more test users were not found in Auth for deletion, which is okay.');
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
async function seedUser(userData: any, password: any) {
    try {
        console.log(`Attempting to create user in Auth: ${userData.email}`);
        
        // Use Admin SDK to create user
        const userRecord = await admin.auth().createUser({
            uid: userData.uid, // Use the predefined UID
            email: userData.email,
            password: password,
            displayName: userData.name,
            photoURL: userData.imageUrl,
            emailVerified: true, // Assume verified for seed data
            disabled: userData.isDisabled || false,
        });
        
        console.log(`Successfully created user in Auth: ${userRecord.email} (UID: ${userRecord.uid})`);

    } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
            console.warn(`WARNING: User with UID ${userData.uid} already exists in Firebase Auth. This is okay.`);
        } else if (error.code === 'auth/email-already-exists') {
             console.warn(`WARNING: User with email ${userData.email} already exists. Skipping Auth creation.`);
        } else {
            console.error(`\nCRITICAL ERROR creating user ${userData.email} in Auth:`, error.message);
            console.error('The script will stop to prevent inconsistent data.\n');
            throw error; // Stop the script
        }
    }
    
    // Now set the data in Firestore
    try {
        await setDoc(doc(db, 'users', userData.uid), userData);
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
    const testPassword = 'password123456'; 
    console.log('Seeding users...');
    
    try {
        await seedUser(studentUser, testPassword);
        await seedUser(psychologistUser, testPassword);
        await seedUser(approvedPsychologistUser, testPassword);
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
        clearCollection('reports'), // Also clear reports
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
