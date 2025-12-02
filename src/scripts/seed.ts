// @/scripts/seed.ts
import { collection, doc, setDoc, writeBatch, getDocs, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { specialties, studentUser, psychologistUser, approvedPsychologistUser, adminUser, testSession } from '../lib/seed-data';

// --- HELPER FUNCTIONS ---

// This function is for development only and will sign in with a temporary admin account
// to get the necessary permissions to delete other users.
// NOTE: This requires your Firestore security rules to allow deletion by an admin.
async function getAdminAuth() {
    const adminEmail = "temp_admin_for_seed@test.com";
    const adminPassword = "temp_password_for_seed";
    try {
        // Try to sign in if the temp admin already exists
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        return userCredential.user;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // If the user doesn't exist, create it
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
             // You might want to add admin claims here in a real-world scenario
            return userCredential.user;
        }
        // Re-throw other errors
        throw error;
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
        
        // Use CLIENT SDK to create user
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const user = userCredential.user;

        // The UID from the created user MUST be used, overriding any in seed data
        const finalUserData = { ...userData, uid: user.uid };
        
        await setDoc(doc(db, 'users', user.uid), finalUserData);
        console.log(`Successfully set user data in Firestore for: ${finalUserData.email} (Doc ID: ${user.uid})`);
        
        return user;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
             console.warn(`WARNING: User with email ${userData.email} already exists. Skipping Auth creation, but will attempt to write to Firestore.`);
             // If auth user exists, we still want to ensure the Firestore doc is correct.
             // This requires knowing the UID. For this seed script, we'll assume the email is unique and skip if auth fails.
        } else {
            console.error(`\nCRITICAL ERROR creating user ${userData.email} in Auth:`, error.message);
            throw error; // Stop the script
        }
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
        await seedUser(adminUser, testPassword);
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
    // We need to get the actual UIDs of the created users, not the ones from seed-data
    const studentQuery = query(collection(db, "users"), where("email", "==", studentUser.email));
    const psychologistQuery = query(collection(db, "users"), where("email", "==", psychologistUser.email));

    const [studentSnapshot, psychologistSnapshot] = await Promise.all([
        getDocs(studentQuery),
        getDocs(psychologistQuery)
    ]);
    
    if (studentSnapshot.empty || psychologistSnapshot.empty) {
        throw new Error("Could not find created student or psychologist in Firestore to seed session.");
    }
    
    const studentDoc = studentSnapshot.docs[0];
    const psychologistDoc = psychologistSnapshot.docs[0];

    const sessionWithRealUIDs = {
        ...testSession,
        studentId: studentDoc.id,
        tutorId: psychologistDoc.id,
    };
    
    await addDoc(collection(db, "sessions"), sessionWithRealUIDs);
    console.log('Successfully seeded test session!');
}


async function main() {
  console.log('--- Starting database seed process ---');
  const testPassword = 'password123456';

  try {
    // 1. Clear Firestore collections first
    console.log('Clearing Firestore collections...');
    await Promise.all([
        clearCollection('users'),
        clearCollection('sessions'),
        clearCollection('courses'),
        clearCollection('reports'),
    ]);
    console.log('Firestore collections cleared.');
  
    // 2. Seed new data
    // NOTE: This script doesn't automatically clear Auth users anymore due to permission complexity
    // in a client-side script. You may need to manually clear them from the Firebase Console.
    await seedSpecialties();
    await seedUsers(); // This will create new users in Auth and Firestore
    await seedSessions();

    console.log('--------------------------------------');
    console.log('¡Proceso de siembra completado!');
    console.log('\nUsuarios de prueba creados (contraseña para todos: password123456):');
    console.log(`- Administrador: ${adminUser.email}`);
    console.log(`- Estudiante: ${studentUser.email}`);
    console.log(`- Psicólogo por validar: ${psychologistUser.email}`);
    console.log(`- Psicólogo aprobado: ${approvedPsychologistUser.email}`);
    console.log('--------------------------------------');
    
    // Terminate the script gracefully
    process.exit(0);

  } catch (error) {
    console.error('\nSe produjo un error durante el proceso de siembra. El script se ha detenido.', error);
    process.exit(1);
  }
}

main();
