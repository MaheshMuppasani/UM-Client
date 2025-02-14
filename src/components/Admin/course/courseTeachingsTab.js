import { Button } from "react-bootstrap";
import { groupCoursesBySemesters, SemesterCourses } from "../../Faculty/facultyCourses";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddCourseTeachingModal from "./addCourseTeachingModal";
import CourseTeachingSectionInfo from "./courseTeachingSectionInfo";

const CourseTeachingsTab = (props) => {
    const [sections, setSections] = useState([]);
    const [course, setCourse] = useState(null);
    const { courseId } = useParams();
    const [addSectionModal, setAddSectionModal] = useState(false);
    const [editSection, setEditSection] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    const toggleAddSectionModal = (e) => {
        if (e) e.stopPropagation();
        setAddSectionModal(!addSectionModal)
    }

    const closeAddSectionModal = (e) => {
        if (e) e.stopPropagation();
        setEditSection(null);
        toggleAddSectionModal();
    }

    const handleSectionEdit = (e, section) => {
        if (e) e.stopPropagation();
        setEditSection(section);
        toggleAddSectionModal();
    }

    const handleSectionDelete = (e, section) => {

    }

    const getCourseSections = () => {
        const url = URLS.getAllCourseSections;
        const params = {
            Course_ID: courseId
        }
        axiosInstance.get(url, { params }).then(data => {

            const groupedObj = data.data.reduce(groupCoursesBySemesters, []);

            setSections(groupedObj)
        })
    }

    const getCourse = () => {
        let url = `${URLS.getCourseByID}/${courseId}`
        axiosInstance.get(url).then((res) => {
            setCourse(res.data);
        })
    }

    useEffect(() => {
        getCourse();
        getCourseSections();
    }, [courseId])

    return (
        <div className="mt-3 maxHeight" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: '30px' }}>
                <Button className="btn-sm" onClick={toggleAddSectionModal}>New Teaching Section</Button>
            </div>
            <div className="d-flex maxHeight flex-row">
                <div className="flex-grow-1">
                    {sections.length ?
                        <SemesterCourses
                            handleSectionSelect={(e, val) => setSelectedSection(val)}
                            courses={sections}
                            handleEdit={handleSectionEdit}
                            handleDelete={handleSectionDelete}
                            selectedSectionId={selectedSection ? selectedSection.Section_ID : null}
                        /> : <p className="fw-lighter text-center my-auto">This course don't have any sections</p>
                    }
                </div>
                <div className="maxHeight border" style={{ maxWidth: '330px', width: '330px', marginTop: '50px', marginLeft: '10px', position: 'sticky', top: '50px' }}>
                    <div className="maxHeight" style={{ fontSize: '0.85em' }}>
                        {
                            selectedSection && selectedSection.Section_ID ? <CourseTeachingSectionInfo Section={selectedSection} />
                                : <div className="maxHeight align-items-center justify-content-center text-secondary fw-light text-center">Select a teaching section to view its details</div>
                        }
                    </div>
                </div>
            </div>
            {
                addSectionModal && (
                    <AddCourseTeachingModal
                        courseID={Number(courseId)}
                        show={addSectionModal}
                        programId={course?.Course_ProgramID}
                        courses={[course]}
                        onHide={closeAddSectionModal}
                        onSubmitSuccess={getCourseSections}
                        content={editSection}
                    />
                )
            }
        </div>
    );
}

export default CourseTeachingsTab;