export const formDataHeaders = {
    headers: {
        "Content-Type": "multipart/form-data", // Important for file uploads
    },
}

export const URLS = {
    getAllStudentSubmissions: "/exams/getAllStudentSubmissions",
    getAllSectionAssignments: "/exams/getAllSectionAssignments",
    getExamDetails: "/exams/getExamDetails",
    createExam: "/exams/createExam",
    updateExam: "/exams/updateExam",
    deleteExam: "/exams/deleteExam",
    getAllContentExams: "/exams/getAllContentExams/",
    getAllTeachingSectionExams: "/exams/getAllTeachingSectionExams/",
    getAllSectionGrades: "/exams/getAllSectionGrades",
    submitAssignment: "/exams/submitAssignment",
    getSubmission: "/exams/getSubmission",
    getStudentSubmissions: "/exams/getStudentSubmissions",
    submitGrading: "/exams/submitGrading",
    postAllSectionGrades: "/exams/postAllSectionGrades",
    getAllStudentExamDeadlineInfo: "/exams/getAllStudentExamDeadlineInfo",

    
    getAllSectionAnnouncements: "/announcements/getAllSectionAnnouncements",
    postAnnouncement: "/announcements/postAnnouncement",

    
    getCourseByID: "/courses/getCourseByID",
    deleteCourseContent: "/courses/deleteCourseContent",
    createCourseContent: "/courses/createCourseContent",
    updateCourseContent: "/courses/updateCourseContent",
    getAllCourseContents: "/courses/getAllCourseContents/",
    getCoursesByDepartmentWithSemesters: '/courses/getCoursesByDepartmentWithSemesters',
    addCoursePreRequisites: "/courses/addCoursePreRequisites",
    getAllCoursePreRequisites: "/courses/getAllCoursePreRequisites",
    updateCoursePreRequisites: "/courses/updateCoursePreRequisites",


    
    facultyME: '/faculty/me',
    getFacultyCoursesBySemester: "/faculty/getCoursesBySemester",
    getFacultiesByProgramID: "/faculty/getFacultiesByProgramID",
    getAllStudentDetailsOfSection: "/faculty/getAllStudentDetailsOfSection",

    studentME: '/students/me',
    getCoursesBySemester: "/students/getCoursesBySemester",
    dropCourse: "/students/dropCourse",
    enrollCourse: "/students/enrollCourse",
    getStudentEnrollments: "/students/getStudentEnrollments",


    getAllCourses: "/admin/getAllCourses",
    addNewCourse: "/admin/addNewCourse",
    editCourse: "/admin/editCourse",
    deleteCourse: "/admin/deleteCourse",

    getAllPrograms: "/admin/getAllPrograms",
    addNewProgram: "/admin/addNewProgram",
    editProgram: "/admin/editProgram",
    deleteProgram: "/admin/deleteProgram",

    getAllFaculty: "/admin/getAllFaculty",
    addNewFaculty: "/admin/addNewFaculty",
    editFaculty: "/admin/editFaculty",
    deleteFaculty: "/admin/deleteFaculty",

    getAllCourseSections: "/admin/getAllCourseSections",
    addNewTeachingSection: "/admin/addNewTeachingSection",
    editTeachingSection: "/admin/editTeachingSection",

    checkAllGradesWerePosted: '/admin/checkAllGradesWerePosted',
    updateCourseEnrollmentsStatus: '/admin/updateCourseEnrollmentsStatus',
    saveProgressAndChangeSemester: '/admin/saveProgressAndChangeSemester',
    studentPassPercentageForCourses: "/admin/studentPassPercentageForCourses",
    courseEnrollmentsBySemester: "/admin/courseEnrollmentsBySemester",
    totalStudentsEnrolledPerSemester: "/admin/totalStudentsEnrolledPerSemester",
    getStudentDistributionByProgram: "/admin/getStudentDistributionByProgram",


    getFile: "/files/getFile",


    getFacultyDetails: "/common/getFacultyDetails",

    getAllConstants: '/constants/getAllConstants',


    login: '/auth/login',
    register: '/auth/register',
    
    
    userME: '/user/me',
}