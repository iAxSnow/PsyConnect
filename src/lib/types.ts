export interface Course {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  tutor: Pick<User, 'name' | 'imageUrl'>;
  course: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  studentId?: string;
  tutorId?: string;
}

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  imageUrl: string;
  isTutor: boolean;
  // Tutor-specific fields (optional)
  rating?: number;
  reviews?: number;
  hourlyRate?: number;
  courses?: string[];
  bio?: string;
}

// This was the old Tutor type, it's now merged into User
// export interface Tutor {
//   id: string;
//   name: string;
//   imageUrl: string;
//   rating: number;
//   reviews: number;
//   hourlyRate: number;
//   courses: string[];
//   bio: string;
// }
