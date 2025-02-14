import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import CourseDetailsTabContainer from "./courseDetailsTabContainer";
import { Button } from "react-bootstrap";
import AddCourseModal from "./AddCourseModal";
import { useConstants } from "../../../constantsProvider";

const AdminCourseDetailsPage = (props) => {
    const { courseId } = useParams();
    const location = useLocation();
    const { constants } = useConstants();
    const [course, setCourse] = useState(null);
    const [addCourseModal, setAddCourseModal] = useState(false);



    const toggleAddCourseModal = (e) => {
        e && e.stopPropagation();
        setAddCourseModal(!addCourseModal);
    }

    const closeCourseModal = (e) => {
        e && e.stopPropagation();
        toggleAddCourseModal();
    }

    const handleEditCourse = (e) => {
        e.stopPropagation();
        toggleAddCourseModal();
    }

    useEffect(() => {
        let url = `${URLS.getCourseByID}/${courseId}`
        axiosInstance.get(url).then((res) => {
            setCourse(res.data);
        })
    }, [courseId])

    let programRequiredBadge = null;
    if(course?.Program_required && constants.programs){
        const courseProgramID = course.Program_required;
        const program = constants.programs.find(p => p.ProgramID === courseProgramID);
        if(program){
            programRequiredBadge = <span className="badge text-bg-warning mx-2 text-white">Program Required</span>
        }
    }
    return (
        <div className="maxHeight">
            <div className="StudentProfile maxHeight">
                <h2 className="d-flex mb-3 align-items-baseline gap-3">
                    <Link className={`sectionClick fw-lighter text-primary text-decoration-none`} to={"/courses"}>Courses</Link>
                    {
                        course ?
                            (<div className="fw-normal fs-6 d-flex gap-2 flex-wrap">
                                <div>{">> "} {course.course_code} {course.Course_Name} [CR {course.CreditHours}] {programRequiredBadge ? programRequiredBadge : ""}</div>
                            </div>) : ("")
                    }
                    <Button className="btn-sm" style={{ marginLeft: 'auto' }} onClick={handleEditCourse}>Edit Course</Button>
                </h2>

                <div className="maxHeight">
                    <CourseDetailsTabContainer />
                </div>
                {
                    addCourseModal && (
                        <AddCourseModal
                            show={addCourseModal}
                            onHide={closeCourseModal}
                            onSubmitSuccess={() => {}}
                            content={course}
                        />
                    )
                }
            </div>
        </div>);
}

export default AdminCourseDetailsPage;