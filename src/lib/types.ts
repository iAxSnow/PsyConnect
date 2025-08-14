export interface Tutor {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  courses: string[];
  bio: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  tutor: Pick<Tutor, 'name' | 'imageUrl'>;
  course: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
