import { useEffect, useState } from "react";
import { renderDepartments, renderSemesters } from "./studentRegistration";
import axiosInstance from "../../axiosInstance";
import { useToast } from "../../AppToast";
import { URLS } from "../../assets/urlConstants";
import { useConstants } from "../../constantsProvider";
import { dateFormat, formatDateToLocaleString } from "../../utils/utils";

const inputFieldIDs = {
    semester: 'semesterID',
    department: 'departmentID',
}

export const commaSeperateFullName = (fName = "") => fName.split(" ").join(", ")

const CourseEnrollmentTable = (props) => {
    const { courses, enrollment_deadline = null, disableActions = false, is_completed, handleRowClick } = props;
    const deadlinePassed = enrollment_deadline && (dateFormat(new Date()) - dateFormat(`${enrollment_deadline.split('T')[0]}T23:59:00-05:00`) > 0)

    const dropCourse = async (e, data) => {
        e.stopPropagation();
        if (deadlinePassed) return;
        const url = URLS.dropCourse;
        try {
            const response = await axiosInstance.delete(url, { data });
            props.next(e);
        } catch (err) {

            console.log(err);
        }
    }
    const handleClick = (e, course) => {
        if (handleRowClick) return handleRowClick(e, course);
    }
    return (
        <tbody>
            {
                courses.map(course => {
                    const { Course_ID, Section_ID, Course_Name, CreditHours, FacultyName, Section_DeliveryMode, course_code, Enrollment_Status } = course;
                    const data = {
                        CourseID: Course_ID,
                        SectionID: Section_ID
                    }
                    return (
                        <tr key={Course_ID} className="cursor-pointer" onClick={e => handleClick(e, course)}>
                            <td>{course_code}</td>
                            <td>{Course_Name}</td>
                            <td>{CreditHours}</td>
                            <td>{commaSeperateFullName(FacultyName)}</td>
                            <td>{Section_ID}</td>
                            <td>{Section_DeliveryMode}</td>
                            <td>
                                {
                                    (is_completed || deadlinePassed || disableActions) ? <span className="px-2 bg-dark-subtle text-white rounded">{Enrollment_Status}</span> : <button className="btn btn-sm btn-danger py-0" onClick={e => dropCourse(e, data)}>Drop</button>
                                }
                            </td>
                        </tr>
                    )
                })
            }
        </tbody>
    )
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const CourseEnrollmentTables = (props) => {
    const { handleRowClick, disableActions = false } = props;
    return (
        <div>
            <table className="table fw-light table-hover">
                <thead>
                    <tr>
                        <th scope="col">Course Code</th>
                        <th scope="col">Course Name</th>
                        <th scope="col">Course Credits</th>
                        <th scope="col">Faculty</th>
                        <th scope="col">Section</th>
                        <th scope="col">Delivery Mode</th>
                        <th scope="col">Action/Status</th>
                    </tr>
                </thead>
                {
                    props.enrollments.map(en => {
                        const { semester_id, semester_term, semester_year, courses, is_completed, enrollment_deadline = "", is_current_semester } = en;
                        return (
                            <>
                                <td colSpan={8} className="m-0 fw-normal">
                                    <p className="m-0 p-2 tableGroupLabel d-flex">
                                        <span className="bg-transparent p-0">{capitalizeFirstLetter(semester_term)} {semester_year} ({is_current_semester ? <span className="mx-1">Current Term</span> : <span className="mx-1">{is_completed ? 'Previous Term' : 'Future Term'}</span>})</span>
                                    </p>
                                </td>
                                <CourseEnrollmentTable
                                    handleRowClick={handleRowClick}
                                    courses={courses}
                                    next={props.next}
                                    is_completed={is_completed}
                                    enrollment_deadline={enrollment_deadline}
                                    disableActions={disableActions}
                                />
                            </>
                        )
                    })
                }
            </table>
        </div>

    )
}

const StudentEnrollments = (props) => {
    const [enrollments, setEnrollments] = useState([]);

    const getStudentEnrollments = () => {
        const url = URLS.getStudentEnrollments;
        axiosInstance.get(url).then(data => {
            setEnrollments(data.data)
        })
    }
    useEffect(() => {
        getStudentEnrollments();
    }, [])
    return (
        <div className="p-3 d-flex flex-column">
            <p className="mt-1 mb-3 fs-5 fw-lighter">Current and Future Enrollments</p>
            {enrollments.length ?
                <CourseEnrollmentTables
                    enrollments={enrollments}
                    next={getStudentEnrollments}
                /> : <p className="fw-lighter text-center my-auto">You don't have any enrollments</p>}
        </div>
    )
}

const CourseSectionTable = (props) => {
    const { Course_ID, eligible_to_enroll = null, enrollment_deadline = null } = props;
    const { addToast } = useToast();
    const deadlinePassed = enrollment_deadline && (dateFormat(new Date()) - dateFormat(enrollment_deadline) > 0)

    const enrollCourse = async (e, data, next) => {
        const url = URLS.enrollCourse;
        try {
            const response = await axiosInstance.post(url, data);
            next(e);
        } catch (err) {
            addToast(err.data, 'danger')
            console.log(err);
        }
    }

    const dropCourse = async (e, data, next) => {
        e.stopPropagation();
        const url = URLS.dropCourse;
        try {
            const response = await axiosInstance.delete(url, { data });
            next(e);
        } catch (err) {
            addToast(err.data, 'danger')
            console.log(err);
        }
    }

    const handleUserRequest = (e) => {
        e.stopPropagation();
        addToast('Sorry, this feature is not yet implemented', 'danger')
    }

    return (
        <tbody>
            {
                props.sections.map(section => {
                    let { section_id, deliveryMode, instructor_fname, instructor_lname, enrolledCount, capacity, enrolled, enrollment_status, SemesterID } = section;
                    enrolled = enrolled ? Number(enrolled) : enrolled;
                
                    const AvailableCount = capacity - enrolledCount;

                    const data = {
                        SectionID: section_id,
                        Enrollment_Status: 'Enrolled',
                        Course_ID,
                        SemesterID
                    }
                    return (
                        <tr key={section_id}>
                            <td>{section_id}</td>
                            <td>{deliveryMode}</td>
                            <td>{instructor_lname}, {instructor_fname}</td>
                            <td>
                                <div className="d-flex flex-column">
                                    <span style={{ fontSize: '12px' }}>Total: {capacity}</span><span style={{ fontSize: '12px' }}>Available: {AvailableCount}</span>
                                </div>
                            </td>
                            <td className="text-center">
                                {
                                    enrolled && !deadlinePassed ? (
                                        <button
                                            className={`btn btn-sm  py-0 btn-danger`}
                                            onClick={(e) => dropCourse(e, data, props.next)}
                                        >Drop</button>
                                    ) : (
                                        eligible_to_enroll && !enrolled && AvailableCount? (
                                            <button
                                                className={`btn btn-sm  py-0 btn-success`}
                                                onClick={(e) => enrollCourse(e, data, props.next)}
                                            >Enroll</button>
                                        ) : (((!eligible_to_enroll && !enrolled) || !AvailableCount)
                                            ? <button className={`btn btn-sm  py-0 btn-info text-white`} onClick={handleUserRequest}>Request</button>
                                            : (enrollment_status ? <span className="px-2 bg-dark-subtle text-white rounded">{enrollment_status}</span> : ""))
                                    )
                                }
                            </td>
                        </tr>
                    )
                })
            }
        </tbody>
    )
}

const CourseSectionTables = (props) => {
    return (
        <div>
            <table className="table fw-light align-middle">
                <thead>
                    <tr>
                        <th scope="col">Section ID</th>
                        <th scope="col">Mode</th>
                        <th scope="col">Faculty</th>
                        <th scope="col">Availability</th>
                        <th scope="col" className="text-center">Action</th>
                    </tr>
                </thead>
                {
                    props.courses.map(course => {
                        const { Course_ID, Course_Name, CreditHours, sections, prerequisites, course_code, eligible_to_enroll, enrollment_deadline } = course;
                        let parsed_prerequisites = JSON.parse(prerequisites);
                        let pre_req_courses = [];
                        if (parsed_prerequisites) {
                            parsed_prerequisites.map(preReq => {
                                if (preReq.prerequisite_id) {
                                    pre_req_courses.push(preReq.prerequisite_code)
                                }
                            })
                        }
                        return (
                            <>
                                <td colSpan={5} className="m-0 fw-normal">
                                    <p className="m-0 p-1 tableGroupLabel d-flex align-items-center">
                                        <span className="bg-transparent p-0">{course_code} {Course_Name} [CR {CreditHours}]</span>
                                        {
                                            <span className="bg-transparent py-0" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{pre_req_courses.length ? `Pre-requisites: ${pre_req_courses.join(', ')}` : ''}</span>
                                        }
                                        {
                                            <span className="bg-transparent align-items-center py-0 d-flex flex-column" style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                                                <span className="text-decoration-underline">Enroll/Drop Deadline</span>
                                                <span className="fw-light">{enrollment_deadline ? formatDateToLocaleString(enrollment_deadline).split(', ')[0] + ' 11:59 PM' : ""}</span>
                                            </span>
                                        }
                                    </p>
                                </td>
                                <CourseSectionTable
                                    sections={JSON.parse(sections)}
                                    Course_ID={Course_ID}
                                    next={props.next}
                                    eligible_to_enroll={eligible_to_enroll || 0}
                                    enrollment_deadline={enrollment_deadline || null}
                                />
                            </>
                        )
                    })
                }
            </table>
        </div>
    )
}

const CourseSearch = (props) => {
    const [searchForm, setSearchForm] = useState({
        [inputFieldIDs.semester]: null,
        [inputFieldIDs.department]: null,
        courseSearch: "",
        termError: "",
        searchError: "",
    })
    const [courses, setCourses] = useState(null);

    const { constants } = useConstants();
    const { semesters, departments } = constants;

    const updateInput = (e) => {
        const tempForm = { ...searchForm };
        const value = e.target.value;
        const property = e.target.id;
        tempForm[property] = (property === inputFieldIDs.department || property === inputFieldIDs.semester) ? Number(value) : value;
        if (tempForm[inputFieldIDs.semester]) {
            tempForm.termError = "";
        }
        if (tempForm.courseSearch || tempForm[inputFieldIDs.department]) {
            tempForm.searchError = "";
        }
        setSearchForm({
            ...tempForm
        })
    }

    const searchCourses = async (e) => {
        e.preventDefault();
        const tempForm = { ...searchForm };
        if (!tempForm[inputFieldIDs.semester]) {
            tempForm.termError = "Academic Term Is Required"
        }
        if (!tempForm[inputFieldIDs.department] && !tempForm.courseSearch) {
            tempForm.searchError = "Department or key words Required"
        }
        if (tempForm.termError || tempForm.searchError) {
            setSearchForm(tempForm);
            return;
        }
        const url = URLS.getCoursesByDepartmentWithSemesters;
        const params = {
            departmentID: searchForm[inputFieldIDs.department] || null,
            semesterID: searchForm[inputFieldIDs.semester] || null,
            courseSearch: searchForm.courseSearch || null
        };
        try {
            const response = await axiosInstance.get(url, { params })
            setCourses(response.data);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="d-flex">
            <div className="w-50 p-3">
                <p className="mt-1 mb-3 fs-5 fw-lighter">Search Courses</p>
                <form>
                    <div className="mb-2">
                        <label for={inputFieldIDs.semester} className="form-label">Academic Term<span className="text-danger"> *</span></label>
                        <select
                            className={`form-select form-control ${searchForm.termError ? 'is-invalid' : ""}`}
                            aria-label="Select academic term"
                            value={searchForm[inputFieldIDs.semester]}
                            onChange={updateInput}
                            id={inputFieldIDs.semester}
                        >
                            <option value={0}>Select academic term</option>
                            {
                                semesters && renderSemesters(semesters)
                            }
                        </select>
                        <div id="validationFNameFeedback" style={{ fontSize: '12px' }} className={`${searchForm.termError ? "invalid-feedback" : ""}`}>
                            {
                                searchForm.termError
                                    ? searchForm.termError
                                    : <span aria-hidden="true" className="invisible">.</span>
                            }
                        </div>
                    </div>
                    <div className="mb-3">
                        <label for={inputFieldIDs.department} className="form-label">Department</label>
                        <select
                            className={`form-select form-control ${searchForm.searchError ? 'is-invalid' : ""}`}
                            aria-label="Select academic term"
                            value={searchForm[inputFieldIDs.department]}
                            onChange={updateInput}
                            id={inputFieldIDs.department}
                        >
                            <option value={0}>Select department</option>
                            {
                                departments && renderDepartments(departments)
                            }
                        </select>
                    </div>
                    <div className="mb-3">
                        <label for="courseSearch" className="form-label">Key words</label>
                        <input
                            type="text"
                            value={searchForm.courseSearch}
                            onChange={updateInput}
                            placeholder="Course, Faculty, Department ..."
                            className={`form-control ${searchForm.searchError ? 'is-invalid' : ""}`}
                            id="courseSearch"
                        />
                        <div id="validationFNameFeedback" style={{ fontSize: '12px' }} className={`${searchForm.searchError ? "invalid-feedback" : ""}`}>
                            {
                                searchForm.searchError
                                    ? searchForm.searchError
                                    : <div aria-hidden="true" className="mt-1 invisible">.</div>
                            }
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="mt-2 px-4 submit btn btn-primary" onClick={searchCourses}>Search</button>
                    </div>
                </form>
            </div>
            <div className="w-50 p-3 d-flex flex-column">
                <p className="mt-1 mb-3 fs-5 fw-lighter">Search Results</p>
                {courses && !courses.length ? <p className="fw-lighter text-center my-auto">No teaching sections found with this search criteria</p> : (!courses ? <p className="fw-lighter text-center my-auto">Enter academic term or semester to view courses</p> : <CourseSectionTables courses={courses} next={searchCourses} />)}
            </div>
        </div>
    )
}

const StudentEnrollment = (props) => {
    const [tabSelected, setTabSelected] = useState(0);

    const handleTabClick = (e) => {
        setTabSelected(e.target.value)
    }
    return (
        <div className="StudentProfile">
            <h2 className="mb-3">
                <p className="fw-lighter">Enrollments</p>
            </h2>
            <div>
                <ul className="nav nav-tabs">
                    <li className="nav-item w-50">
                        <button
                            className={`w-100 nav-link text-center ${tabSelected == 0 ? 'active' : ''}`}
                            onClick={handleTabClick}
                            value={0}
                        >Search Courses and Enroll</button>
                    </li>
                    <li className="nav-item w-50">
                        <button
                            className={`w-100 nav-link text-center ${tabSelected == 1 ? 'active' : ''}`}
                            onClick={handleTabClick}
                            value={1}
                        >My Enrollments</button>
                    </li>
                </ul>
                <div>
                    {tabSelected == 0 ? <CourseSearch /> : <StudentEnrollments />}
                </div>
            </div>
        </div>
    );
}

export default StudentEnrollment;