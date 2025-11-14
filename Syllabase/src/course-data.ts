export interface Course {
    department: string;
    professor: string;
    courseNumber: string;
    courseName: string;
    university: string;
}

export const defaultCourses: Course[] = [
  { department: "Computer Science", professor: "Frank Santana", courseNumber: "123", courseName: "Human Computer Interaction", university: "Stanford" },
  { department: "Mathematics", professor: "Tony Stark", courseNumber: "141", courseName: "Calculus IV", university: "CP SLO" },
  { department: "English", professor: "Thor", courseNumber: "101", courseName: "Film Genres", university: "Howard" },
  { department: "Social Science", professor: "Steve Rodgers", courseNumber: "201", courseName: "History After 1865", university: "Clark Atlanta" },
  { department: "Environmental Science", professor: "Bruce Banner", courseNumber: "450", courseName: "Environmental Science", university: "USC" },
  { department: "Computer Science", professor: "Patrick Mahomes", courseNumber: "222", courseName: "Computer Interaction of Humans", university: "UIUC" },
  { department: "Computer Science", professor: "Michael Jackson", courseNumber: "130A", courseName: "Artificial Intelligence", university: "Howard" },
  { department: "Architecture & Design", professor: "Frank Lloyd Wright", courseNumber: "218", courseName: "History of Architecture", university: "WashU" },
  { department: "Business", professor: "The Business Man", courseNumber: "312", courseName: "Business Accounting", university: "Harvard" },
  { department: "Engineering", professor: "The Engineer", courseNumber: "225", courseName: "Computer Programming", university: "Cal Tech" },
  { department: "Liberal Arts", professor: "The Artist", courseNumber: "302B", courseName: "Liberal Arts", university: "Chaplan" },
  { department: "Science", professor: "Bill Nye", courseNumber: "430", courseName: "Biology", university: "Nortwestern" },
  { department: "Social Science", professor: "The Historian", courseNumber: "202", courseName: "History Before 1865", university: "Spelman" }
];