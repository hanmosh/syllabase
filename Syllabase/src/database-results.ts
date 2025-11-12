import { Course, defaultCourses } from "./course-data.js";

// COURSE DATA
if (!localStorage.getItem("syllabaseData")) {
  localStorage.setItem("syllabaseData", JSON.stringify(defaultCourses));
}

// QUICK SEARCH

// RESULTS DATABASE
