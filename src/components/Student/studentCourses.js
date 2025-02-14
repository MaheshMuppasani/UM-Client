import { useEffect, useState } from "react";
import { CourseEnrollmentTables } from "./studentEnrollment";
import axiosInstance from "../../axiosInstance";
import CourseBreadCrumbs from "../Course/courseBreadCrumbs";
import CourseContentPage from "../Course/courseContentPage";
import { URLS } from "../../assets/urlConstants";

const StudentCourses = (props) => {
    const [enrollments, setEnrollments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState({});
    const [contentStack, setContentStack] = useState([]);

    const getStudentCourses = () => {
        const url = URLS.getCoursesBySemester
        axiosInstance.get(url).then(data => {
            setEnrollments(data.data.sort((s1, s2) => s2.semester_id - s1.semester_id))
        })
    }

    const openCourseDetails = (e, course) => {
        e.stopPropagation();
        setContentStack([]);
        if (course)
            setSelectedCourse({ ...course, courseID: course.Course_ID })
        else setSelectedCourse({})
    }
    useEffect(() => {
        getStudentCourses();
    }, [])

    const handleGoToFolder = (index) => {
        let tempContent = [...contentStack];
        tempContent.splice(index + 1)
        setContentStack(tempContent)
    }

    const popContent = (e) => {
        e.stopPropagation();
        let tempContent = [...contentStack];
        tempContent.pop();
        setContentStack(tempContent)
    }
    return (
        <div className="StudentProfile">
            <h2 className="d-flex mb-2 align-items-baseline gap-3">
                <p className={`sectionClick fw-lighter ${selectedCourse.Section_ID ? 'text-primary' : ''}`} onClick={openCourseDetails}>Courses</p>
                {
                    selectedCourse.Section_ID ? (
                        <CourseBreadCrumbs
                            contentStack={contentStack}
                            handleGoToFolder={handleGoToFolder}
                            selectedSection={selectedCourse}
                        />
                    ) : ("")
                }
            </h2>
            {
                selectedCourse.Section_ID ? (
                    <CourseContentPage
                        selectedSection={selectedCourse}
                        contentStack={contentStack}
                        setContentStack={setContentStack}
                        popContent={popContent}
                    />
                ) : (
                    <div>
                        {enrollments.length ?
                            <CourseEnrollmentTables
                                handleRowClick={openCourseDetails}
                                enrollments={enrollments}
                                next={getStudentCourses}
                                disableActions = {true}
                            /> : <p className="fw-lighter text-center my-auto">You don't have any enrollments</p>}
                    </div>
                )
            }

        </div>
    );
}

export default StudentCourses;