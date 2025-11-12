export interface Course {
    department: string;
    professor: string;
    courseNumber: string;
    courseName: string;
    university: string;
}

export const defaultCourses: Course[] = [
  { department: "Computer Science", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" }
];