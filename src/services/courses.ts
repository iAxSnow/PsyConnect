// @/services/courses.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Course } from "@/lib/types";

// Fetches all available courses/specialties
export async function getAvailableSpecialties(): Promise<string[]> {
    const coursesCollection = collection(db, "courses");
    const coursesSnapshot = await getDocs(coursesCollection);
    const coursesList = coursesSnapshot.docs.map(doc => doc.data().name as string);
    return coursesList;
}

export async function getAllCourses(): Promise<Course[]> {
      const coursesCollection = collection(db, "courses")
      const coursesSnapshot = await getDocs(coursesCollection)
      return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
}
