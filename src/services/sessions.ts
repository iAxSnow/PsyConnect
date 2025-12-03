// @/services/sessions.ts
import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session, User } from "@/lib/types";

// Fetches all sessions for a specific user (student or psychologist)
export function getSessionsForUser(userId: string, callback: (sessions: Session[]) => void): () => void {
  const q = query(
    collection(db, "sessions"), 
    where("studentId", "==", userId)
  );

  const q2 = query(
    collection(db, "sessions"),
    where("tutorId", "==", userId)
  )

  const unsubscribeStudent = onSnapshot(q, (querySnapshot) => {
    const studentSessions: Session[] = [];
    querySnapshot.forEach((doc) => {
      studentSessions.push({ id: doc.id, ...doc.data() } as Session);
    });
    callback(studentSessions); 
  });
  
  const unsubscribeTutor = onSnapshot(q2, (querySnapshot) => {
    const tutorSessions: Session[] = [];
     querySnapshot.forEach((doc) => {
      tutorSessions.push({ id: doc.id, ...doc.data() } as Session);
    });
    callback(tutorSessions);
  });
  
  return () => {
    unsubscribeStudent();
    unsubscribeTutor();
  };
}


// Fetches pending session requests for a specific psychologist
export async function getPsychologistPendingSessions(tutorId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("tutorId", "==", tutorId),
    where("status", "==", "pending") // Only get pending requests
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });

  return sessions.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
}

// Fetch active sessions for psychologist
export async function getPsychologistActiveSessions(tutorId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("tutorId", "==", tutorId),
    where("status", "==", "accepted") // Accepted sessions
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });

  return sessions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

// Fetches all sessions for a student - used in profile
export async function getStudentSessions(studentId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(
    collection(db, "sessions"), 
    where("studentId", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });
  return sessions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}
