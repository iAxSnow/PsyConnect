// @/components/psychologist/review-section.tsx
"use client"

import * as React from "react"
import { Star, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RatingDialog } from "@/components/profile/rating-dialog"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import type { Review, User } from "@/lib/types"
import { getReviews, addReview } from "@/services/reviews"
import { useToast } from "@/hooks/use-toast"


interface ReviewSectionProps {
    psychologistId: string;
    currentUser: User | null;
}

export function ReviewSection({ psychologistId, currentUser }: ReviewSectionProps) {
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                const fetchedReviews = await getReviews(psychologistId);
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
                toast({
                    title: "Error al cargar reseñas",
                    description: "No se pudieron obtener las reseñas en este momento.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [psychologistId, toast]);

    const handleNewReview = async ({ rating, comment }: { rating: number; comment: string }) => {
        if (!currentUser) {
             toast({
                title: "Inicia sesión",
                description: "Debes iniciar sesión para dejar una reseña.",
                variant: "destructive"
            });
            return;
        };

        try {
            await addReview(psychologistId, {
                rating,
                comment,
                authorId: currentUser.uid,
                authorName: currentUser.name,
                authorImageUrl: currentUser.imageUrl,
            });
            // Refetch reviews to show the new one
            const updatedReviews = await getReviews(psychologistId);
            setReviews(updatedReviews);
            toast({
                title: "Reseña Publicada",
                description: "¡Gracias por tus comentarios!",
            });

        } catch (error) {
             console.error("Failed to submit review:", error);
             toast({
                title: "Error al enviar reseña",
                description: "No se pudo guardar tu reseña. Por favor, inténtalo de nuevo.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Reseñas y Calificaciones ({reviews.length})</h2>
                 {currentUser && currentUser.uid !== psychologistId && (
                    <RatingDialog onReviewSubmit={handleNewReview}>
                        <Button variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" /> Escribir una reseña
                        </Button>
                    </RatingDialog>
                 )}
            </div>
            
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            )}

            {!isLoading && reviews.length === 0 && (
                <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-medium text-muted-foreground">Sin Reseñas Aún</h3>
                    <p className="text-sm text-muted-foreground mt-2">Sé el primero en dejar una reseña para este psicólogo.</p>
                </div>
            )}

            {!isLoading && reviews.length > 0 && (
                <div className="space-y-6">
                    {reviews.map((review) => (
                    <Card key={review.id}>
                        <CardHeader className="p-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                            <AvatarImage src={review.authorImageUrl} alt={review.authorName} data-ai-hint="person" />
                            <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{review.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: es })}
                            </p>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                key={i}
                                className={`h-5 w-5 ${
                                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                                />
                            ))}
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                        <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
