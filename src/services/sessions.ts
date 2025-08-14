// @/services/sessions.ts
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Session } from "@/lib/types";

export async function getStudentSessions(studentId: string): Promise<Session[]> {
  const sessions: Session[] = [];
  const q = query(collection(db, "sessions"), where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() } as Session);
  });
  return sessions;
}
