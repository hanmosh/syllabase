export interface Course {
    department: string;
    professor: string;
    courseNumber: string;
    courseName: string;
    university: string;
}

export const defaultCourses: Course[] = [
  { department: "Computer Science", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "Math", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "English", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "History", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "Environmental Science", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "Computer Science", professor: "Patrick Mahomes", courseNumber: "222", courseName: "Computer Interaction of Humans", university: "UIUC" },
  { department: "Computer Science", professor: "Michael Jackson", courseNumber: "130A", courseName: "Artificial Intelligence", university: "Howard" }
];