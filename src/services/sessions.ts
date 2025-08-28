// @/services/sessions.ts
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/types";

// Fetches sessions for a specific student
export async function getStudentSessions(studentId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });
  return sessions;
}

// Fetches pending session requests for a specific psychologist
export async function getPsychologistSessionRequests(tutorId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("tutorId", "==", tutorId), 
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });
  return sessions;
}
