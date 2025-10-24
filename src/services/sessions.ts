// @/services/sessions.ts
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/types";

// Fetches sessions for a specific student
export async function getStudentSessions(studentId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  // Query is simplified to avoid needing a composite index. Sorting is done client-side.
  const q = query(
    collection(db, "sessions"), 
    where("studentId", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });
  // Sort sessions by creation date descending
  return sessions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

// Fetches pending session requests for a specific psychologist
export async function getPsychologistSessionRequests(tutorId: string): Promise<Session[]> {
  const sessions: Session[] = [];
   // Query is simplified to avoid needing a composite index. Filtering and sorting are done client-side.
  const q = query(
    collection(db, "sessions"), 
    where("tutorId", "==", tutorId)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });

  // Filter for pending requests and sort by creation date ascending
  return sessions
    .filter(session => session.status === 'pending')
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}
