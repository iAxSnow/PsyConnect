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

// Fetches active session requests for a specific psychologist (pending and accepted)
export async function getPsychologistActiveSessions(tutorId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("tutorId", "==", tutorId),
    where("status", "in", ["pending", "accepted"])
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });

  // Sort by status ('pending' first) and then by creation date
  return sessions.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return a.createdAt.toMillis() - b.createdAt.toMillis();
  });
}