import { useEffect, useState } from "react";
import { MailIcon } from "../../../assets/constants";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useConstants } from "../../../constantsProvider";
import { capitalizeFirstLetter } from "../../Student/studentEnrollment";

export const SectionEnrollmentsCard = (props) => {
    const { Section_ID } = props;
    const [loading, setLoading] = useState(false);
    const [enrollments, setEnrollments] = useState(null);
    const toggleLoading = () => setLoading(ps => !ps);
    const { constants } = useConstants();

    const { programTypes } = constants;

    useEffect(() => {
        if (Section_ID) {
            setEnrollments(null);
            const url = URLS.getAllStudentDetailsOfSection;
            const params = {
                SectionId: Section_ID
            }
            toggleLoading();
            axiosInstance.get(url, { params })
                .then(res => {
                    const data = res.data;
                    if (data?.length) {
                        setEnrollments(data)
                    }
                }).finally(toggleLoading)
        }
    }, [Section_ID])
    return (
        <div className="card mb-2 maxHeight">
            <div className="card-header fw-medium px-2">Enrollments Information</div>
            <div className="card-body p-0 maxHeight">
                {
                    enrollments?.length ? (<div>
                        <table className="table table-hover">
                            <thead className="table-primary" style={{ position: "sticky", top: '0' }}>
                                <tr>
                                    <th className="">ID</th>
                                    <th className="">Student Name</th>
                                    <th className="">Program Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    enrollments.map(enrollment => {
                                        const { Student_ID, FirstName, LastName, ProgramTypeID } = enrollment;
                                        return (
                                            <tr key={Student_ID}>
                                                <td className="">{Student_ID}</td>
                                                <td className="table-cell">{`${LastName}, ${FirstName}`}</td>
                                                <td className="table-cell">{programTypes?.find(p=>p.ProgramType_ID===ProgramTypeID).ProgramType_Name || ""}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>)
                        : (<div className="maxHeight align-items-center justify-content-center text-secondary fw-light text-center">{loading ? "Loading..." : "No Students Enrolled Yet"}</div>)
                }
            </div>
        </div>
    )
}

export const FacultyInfoCard = (props) => {
    const { Faculty_ID } = props;
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(false);

    const { constants } = useConstants();
    const { departments } = constants;

    const toggleLoading = () => setLoading(ps => !ps);

    useEffect(() => {
        if (Faculty_ID) {
            const url = URLS.getFacultyDetails;
            const params = {
                facultyId: Faculty_ID
            }
            setFaculty(null);
            toggleLoading();
            axiosInstance.get(url, { params })
                .then(res => {
                    setFaculty(res.data)
                }).finally(toggleLoading)
        }
    }, [Faculty_ID])

    const { FirstName = null, LastName = null, Email = null, Designation = null, DepartmentID = null } = faculty || {};

    return (
        <div className="card mb-2">
            <div className="card-header fw-medium px-2">Faculty Information</div>
            <div className="maxHeight" style={{ minHeight: '150px' }}>
                {
                    faculty ? (
                        <>
                            <div className="d-flex m-2 mb-0">
                                <img src='/person-placeholder.jpg' style={{ height: '100px', width: '100px' }} className="card-img-top" alt="..." />
                                <div className="p-2 px-3 d-flex flex-column gap-1" style={{ fontSize: '0.85rem' }}>
                                    <span>Faculty ID: {Faculty_ID}</span>
                                    <span>Department: {departments?.find(d=>d.Department_ID===DepartmentID).Department_Code || ""}</span>
                                    <span>Designation: {Designation || ""}</span>
                                </div>
                            </div>
                            <div className="card-body p-3 d-flex justify-content-between">
                                <span>Name: {FirstName && LastName ? <span>{`${LastName}, ${FirstName}`}</span> : ""}</span>
                                <a href={`mailto:${Email}`}><MailIcon /></a>
                            </div>
                        </>
                    ) : (<div className="maxHeight align-items-center justify-content-center text-secondary fw-light text-center">{loading ? "Loading..." : "Something went wrong, Retry"}</div>)
                }
            </div>
        </div>
    )
}

const CourseTeachingSectionInfo = (props) => {
    const { Section, hideFacultyInfo = false } = props;

    const { Section_ID = null, Section_DeliveryMode, is_section_open, Faculty_ID, SemesterID, FacultyName, Capacity } = Section;

    const [loading, setLoading] = useState(false);
    const { constants } = useConstants();
    const { semesters } = constants;

    const toggleLoading = () => setLoading(ps => !ps);

    const selectedSem = semesters.find(sem => sem.semester_id === SemesterID);

    return (<div className="maxHeight">
        <div className="p-2 d-flex flex-column border">
            <h6 className="fw-medium d-flex gap-2">
                <span>
                    {
                        selectedSem ? <span>{capitalizeFirstLetter(selectedSem.semester_term)} {selectedSem.semester_year}</span> : ''
                    }
                </span>
                <span>
                    Section-{Section_ID}
                </span>
            </h6>
            <div className="d-flex align-items-center justify-content-between">
                <span>[{Section_DeliveryMode}]</span>
                {
                    is_section_open ? (<span className="px-2 py-1 badge text-bg-success m-0 d-flex align-items-center">Live Now</span>) : ("")
                }
            </div>
        </div>
        <div className="p-2 maxHeight">
            {
                !hideFacultyInfo ? <FacultyInfoCard Faculty_ID={Faculty_ID} /> : ("")
            }
            <SectionEnrollmentsCard Section_ID={Section_ID} />
        </div>
    </div>);
}

export default CourseTeachingSectionInfo;