import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { getCurrentSem } from "../Student/StudentProfile";
import 'react-quill/dist/quill.snow.css';
import CourseBreadCrumbs from "../Course/courseBreadCrumbs";
import CourseContentPage from "../Course/courseContentPage";
import { URLS } from "../../assets/urlConstants";
import { useConstants } from "../../constantsProvider";
import { FacultyIcon } from "../../assets/constants";
import { commaSeperateFullName } from "../Student/studentEnrollment";
import { useUserRole } from "../../userRole";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import CourseTeachingSectionInfo from "../Admin/course/courseTeachingSectionInfo";

const CourseSection = ({ section, handleSectionSelect, course, handleEdit, handleDelete, handleOpenInfo, selectedSectionId = null }) => {
    const { Section_ID, Section_DeliveryMode, Capacity, EnrollmentCount, FacultyName = "", is_section_open = 0 } = section;
    const { courseID, Course_Name, CreditHours, sections, course_code } = course;

    const { isAdmin, isFaculty } = useUserRole();

    const handleSelect = (e) => {
        return handleSectionSelect(e, section, course);
    }

    const onEdit = (e) => {
        handleEdit(e, section);
    }

    const onDelete = (e) => {
        handleDelete(e, section);
    }

    const onOpen = (e) => handleOpenInfo(e, section, course)

    return (
        <div className={`card courseCard ${selectedSectionId===Section_ID? 'active' : ''}`} onClick={handleSelect}>
            <div className="card-body">
                <div className={`d-flex gap-5 flex-grow-1 justify-content-between`}>
                    <h6 className="card-title d-flex gap-5">
                        <span className="p-0">
                            {course_code} {Course_Name} - Section: {Section_ID}
                        </span>
                        {
                            is_section_open ? <span className="p-0 px-2 badge text-bg-success m-0 d-flex align-items-center">Live Now</span> : ""
                        }
                    </h6>
                    {
                        isAdmin() ? (
                            <DropdownButton
                                id={`dropdown-button-drop`}
                                size="sm"
                                variant="secondary"
                                title="options"
                                className="d-flex"
                                onClick={e => e.stopPropagation()}
                            >
                                <Dropdown.Item as="button" onClick={onEdit}>Edit Teaching Section</Dropdown.Item>
                                <Dropdown.Item as="button" onClick={onDelete}>Delete Teaching Section</Dropdown.Item>
                            </DropdownButton>
                        ) : ("")
                    }
                    {
                        isFaculty() ? (
                            <Button size="sm" variant="secondary" className="d-flex px-3" onClick={onOpen}>Go To Section</Button>
                        ) : ("")
                    }
                </div>
                <div className="d-flex fw-light gap-3">
                    <p className="card-text m-0">[{Section_DeliveryMode}] </p>
                    <p className="card-text m-0">Total Enrolled: {EnrollmentCount} / {Capacity}</p>
                    {
                        FacultyName ? <p className="card-text m-0">| Teaching By: {FacultyName ? <span className="fw-normal"><FacultyIcon /> {commaSeperateFullName(FacultyName)}</span> : ""}</p> : ""
                    }
                </div>
            </div>
        </div>
    )
}

const CourseSections = (props) => {
    const { sections } = props;
    return (
        <div className="d-flex flex-column gap-2">
            {
                sections.map(section => <CourseSection section={section} {...props} key={section.Section_ID} />)
            }
        </div>
    )
}

export const SemesterCourses = (props) => {
    const { courses } = props;
    const { constants } = useConstants();
    return (
        <div>
            {
                courses.map(semester => {
                    const { semester_id, courses, is_current_semester, is_completed } = semester;
                    const termText = (is_current_semester ? ('Current Term') : (is_completed ? 'Past Term': 'Coming Up'))
                    return (
                        <div key={semester_id}>
                            <p className="m-0 fs-4">{getCurrentSem(semester_id, constants.semesters)} ({termText})</p>
                            <div className="px-2 pb-2">
                                {
                                    courses.map(course => {
                                        const { courseID, Course_Name, CreditHours, sections, course_code } = course;
                                        return (
                                            <div key={courseID} className="my-2">
                                                <p className="m-0 py-2 fs-5">{course_code} {Course_Name} [CR {CreditHours}]</p>
                                                <CourseSections sections={sections} course={course} {...props} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export const groupCoursesBySemesters = (acc, curr) => {
    const existingEntry = acc.find(entry => entry.semester_id
        === curr.semester_id
    );
    const semesterCourse = (course) => ({
        course_code: course.course_code, 
        courseID: course.Course_ID, 
        Course_Name: course.Course_Name, 
        CreditHours: course.CreditHours, 
        sections: course.sections,
    })
    if (existingEntry) {
        existingEntry.courses.push(semesterCourse(curr));
    } else {
        acc.push({ 
            semester_id: curr.semester_id, 
            courses: [semesterCourse(curr)] ,
            is_current_semester: curr.is_current_semester,
            is_completed: curr.is_completed
        })
    }
    return acc;
}

const FacultyCourses = (props) => {
    const [courses, setCourses] = useState([]);
    const [selectedSection, setSelectedSection] = useState({});
    const [sectionInfo, setSectionInfo] = useState({});
    const [contentStack, setContentStack] = useState([]);

    const getFacultyCourses = () => {
        const url = URLS.getFacultyCoursesBySemester;
        axiosInstance.get(url).then(data => {

            const groupedObj = data.data.reduce(groupCoursesBySemesters, []);

            setCourses(groupedObj)
        })
    }
    useEffect(() => {
        getFacultyCourses();
    }, [])

    const popContent = (e) => {
        e.stopPropagation();
        let tempContent = [...contentStack];
        tempContent.pop();
        setContentStack(tempContent)
    }

    const setShowInfo = (e, section) => {
        e.stopPropagation();
        setSectionInfo(section);
    }

    const handleOpenSection = (e, section, course) => {
        e.stopPropagation();
        setContentStack([]);
        if (section)
            setSelectedSection({ ...section, ...course })
        else {
            setSelectedSection({})
            getFacultyCourses();
        }
    }

    const handleGoToFolder = (index) => {
        let tempContent = [...contentStack];
        tempContent.splice(index + 1)
        setContentStack(tempContent)
    }

    return (
        <div className="StudentProfile">
            <h2 className="d-flex align-items-baseline gap-3">
                <p className={`sectionClick fw-lighter ${selectedSection.Section_ID ? 'text-primary' : ''}`} onClick={handleOpenSection}>Courses</p>
                {
                    selectedSection.Section_ID ? (
                        <CourseBreadCrumbs
                            contentStack={contentStack}
                            handleGoToFolder={handleGoToFolder}
                            selectedSection={selectedSection}
                        />
                    ) : ("")
                }

            </h2>
            {
                selectedSection.Section_ID ? (
                    <CourseContentPage
                        selectedSection={selectedSection}
                        setContentStack={setContentStack}
                        contentStack={contentStack}
                        popContent={popContent}
                    />
                ) : (
                    <div className="d-flex maxHeight flex-row">
                        <div className="flex-grow-1">
                            {courses.length ?
                                <SemesterCourses
                                    handleSectionSelect={setShowInfo}
                                    courses={courses}
                                    handleOpenInfo={handleOpenSection}
                                    selectedSectionId={sectionInfo ? sectionInfo.Section_ID : null}
                                /> : <p className="fw-lighter text-center my-auto">You don't have any courses</p>}
                        </div>
                        <div className="maxHeight border" style={{ maxWidth: '330px', width: '330px', marginTop: '50px', marginLeft: '10px', position: 'sticky', top: '50px' }}>
                            <div className="maxHeight" style={{ fontSize: '0.85em' }}>
                                {
                                    sectionInfo && sectionInfo.Section_ID 
                                        ? <CourseTeachingSectionInfo Section={sectionInfo} hideFacultyInfo={true} />
                                        : <div className="maxHeight align-items-center justify-content-center text-secondary fw-light text-center">Select a teaching section to view its details</div>
                                }
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default FacultyCourses;