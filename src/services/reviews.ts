// @/services/reviews.ts
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Review } from "@/lib/types";

export async function getReviewsForPsychologist(psychologistId: string): Promise<Review[]> {
  const reviewsCollection = collection(db, "reviews");
  const q = query(
    reviewsCollection, 
    where("tutorId", "==", psychologistId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}
