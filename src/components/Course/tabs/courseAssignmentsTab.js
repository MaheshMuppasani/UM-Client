import { useEffect, useState } from "react";
import CourseAssignments from "../courseAssignments";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import NewAssignmentModal from "../assignmentModal";
import AssignmentViewPage from "../AssignmentViewPage";
import { BackIcon } from "../../../assets/constants";
import { createAssignmentHandler } from "./courseContentTab";
import { useToast } from "../../../AppToast";
import { useUserRole } from "../../../userRole";
import { Button } from "react-bootstrap";

const CourseAssignmentTab = (props) => {
    const { selectedSection } = props;
    const [exams, setExams] = useState([]);
    const [AssignmentModalShow, setAssignmentModalShow] = useState(false);
    const [currentExam, setCurrentExan] = useState(null);
    const [editExam, setEditExam] = useState(null);

    const { addToast } = useToast();
    const { isStudent } = useUserRole();

    const toggleAssignmentModal = () => setAssignmentModalShow(!AssignmentModalShow);

    const handleEditExam = (e, exam) => {
        e.stopPropagation();
        setEditExam(exam);
        toggleAssignmentModal();
    }

    const getAllTeachingSeactionExams = () => {
        const url = URLS.getAllTeachingSectionExams;
        const params = {
            sectionId: selectedSection.Section_ID,
            parent_id: null
        }
        axiosInstance.get(url, { params }).then(res => {
            setExams(res.data)
        })
    }

    const closeAssignmentModal = () => {
        setAssignmentModalShow(false);
        setEditExam(null);
    }

    const createAssignment = async (e, formData) => {
        e.stopPropagation();

        const res = await createAssignmentHandler(formData, {
            SectionID: selectedSection.Section_ID,
            parent_contentID: null
        })

        closeAssignmentModal();
        addToast(`The assignment '${formData.contentName}' ${formData.editContent ? 'updated' : 'added'} successfully!`, 'success', 4000);
        getAllTeachingSeactionExams();
    }

    const backToAssignmentsList = e => {
        setCurrentExan(null);
        getAllTeachingSeactionExams();
    }

    useEffect(() => {
        getAllTeachingSeactionExams();
    }, [selectedSection])
    return (
        <div className="maxHeight">
            <div className="fs-4 mt-2 mb-3 d-flex justify-content-between align-items-center">
                {
                    currentExam ? <h5 className={`m-0 py-2 d-flex align-items-center gap-3`}>
                        <button className="navbackbtn px-3 btn btn-link btn-light btn-sm" onClick={backToAssignmentsList}><BackIcon /></button>
                        <div>{currentExam.content_name}</div>
                    </h5> : <div>Assignments</div>
                }
                {
                    !isStudent() && !currentExam ? (
                        <Button className="btn-sm" onClick={toggleAssignmentModal}>Add New Assignment</Button>
                    ) : ("")
                }
            </div>
            <div className="maxHeight">
                {
                    currentExam ? (
                        <AssignmentViewPage content={currentExam} popContent={backToAssignmentsList} />
                    ) : (
                        <div>
                            <CourseAssignments
                                exams={exams}
                                setParentContent={(exam) => setCurrentExan(exam)}
                                handleEditContent={handleEditExam}
                                handleDeleteContent={() => { }}
                            />
                        </div>
                    )
                }
            </div>
            {
                AssignmentModalShow && (
                    <NewAssignmentModal
                        show={AssignmentModalShow}
                        onHide={closeAssignmentModal}
                        handleCreateContent={createAssignment}
                        content={editExam}
                    />
                )
            }
        </div>
    );
}

export default CourseAssignmentTab;