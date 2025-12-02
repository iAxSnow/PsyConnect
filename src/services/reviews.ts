// @/services/reviews.ts
import { collection, query, getDocs, addDoc, serverTimestamp, runTransaction, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Review, User } from "@/lib/types";

// Fetches all reviews for a specific psychologist
export async function getReviews(psychologistId: string): Promise<Review[]> {
    const reviewsCollection = collection(db, "users", psychologistId, "reviews");
    const q = query(reviewsCollection, orderBy("createdAt", "desc"));
    const reviewsSnapshot = await getDocs(q);
    
    if (reviewsSnapshot.empty) {
        return [];
    }

    return reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}


// Adds a review and updates the psychologist's rating
export async function addReview(
    psychologistId: string, 
    reviewData: Omit<Review, 'id' | 'createdAt'>
) {
    const psychologistDocRef = doc(db, "users", psychologistId);
    const reviewsCollectionRef = collection(db, "users", psychologistId, "reviews");

    try {
        await runTransaction(db, async (transaction) => {
            const psychologistDoc = await transaction.get(psychologistDocRef);
            if (!psychologistDoc.exists()) {
                throw "Psychologist not found!";
            }

            // 1. Add the new review
            const newReviewRef = doc(reviewsCollectionRef); // Create a new doc ref in the subcollection
            transaction.set(newReviewRef, {
                ...reviewData,
                createdAt: serverTimestamp(),
            });

            // 2. Update the psychologist's average rating and review count
            const psychologistData = psychologistDoc.data() as User;
            const oldRatingTotal = (psychologistData.rating || 0) * (psychologistData.reviews || 0);
            const newReviewCount = (psychologistData.reviews || 0) + 1;
            const newAverageRating = (oldRatingTotal + reviewData.rating) / newReviewCount;

            transaction.update(psychologistDocRef, {
                reviews: newReviewCount,
                rating: newAverageRating,
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e; // re-throw the error to be caught by the caller
    }
}
