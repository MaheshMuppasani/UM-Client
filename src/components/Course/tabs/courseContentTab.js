import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useToast } from "../../../AppToast";
import axiosInstance from "../../../axiosInstance";
import { BackIcon, contentTypes } from "../../../assets/constants";
import RenderCourseContents from "../../Course/courseContents";
import AddCourseContentModal from "../../Course/addCourseContentModal";
import DeleteContentModal from "../../Course/deleteContentModal";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import NewAssignmentModal from "../assignmentModal";
import { formDataHeaders, URLS } from "../../../assets/urlConstants";
import { useUserRole } from "../../../userRole";

export function isNoContentBody(content) {
    if (content?.content_type === "Exam") return false;
    const contentdata = content?.content_data;
    const sanitizedHtml = DOMPurify.sanitize(contentdata);
    if (!sanitizedHtml) return true;
    if (sanitizedHtml === "<p><br></p>") return true;
    return false;
}

export const RenderContentBody = (props) => {
    const { contents } = props;
    if (!contents) return;
    const { content_data } = contents;
    const sanitizedHtml = DOMPurify.sanitize(content_data);
    return (
        sanitizedHtml && <div className="content-body body mt-2 mb-4 px-4" dangerouslySetInnerHTML={{ __html: sanitizedHtml === "<p><br></p>" ? "" : sanitizedHtml }} />
    )
}

export const createAssignmentHandler = async (formData, { SectionID, parent_contentID }) => {
    const { value, contentName, editContent, file, dueDate, maxScore } = formData;
    const data = {
        ExamID: editContent ? editContent.ExamID : null,
        Title: contentName,
        ExamDueDate: dueDate,
        MaximumScore: maxScore,
        Instructions_data: value,
        file: file || null,
        SectionID,
        parent_contentID: parent_contentID || null
    }
    let url = URLS.createExam
    let updatedFlag = 0;
    if (editContent) {
        updatedFlag = 1;
        url = URLS.updateExam
        const res = await axiosInstance.put(url, data, formDataHeaders)
        return res;
    } else {
        const res = await axiosInstance.post(url, data, formDataHeaders);
        return res;
    }
}

const CourseContentTab = (props) => {
    const { setContentStack, selectedSection, contentStack, popContent } = props;
    const { isStudent } = useUserRole();
    const [currentContents, setCurrentContents] = useState([]);
    const [contentExams, setContentExams] = useState([]);
    const [editContent, setEditContent] = useState(null);
    const [deleteContent, setDeleteContent] = useState(null);
    const [show, setShow] = useState(false);
    const [AssignmentModalShow, setAssignmentModalShow] = useState(false);
    const { addToast } = useToast();


    const handleShow = () => setShow(true);
    const toggleAssignmentModal = () => setAssignmentModalShow(!AssignmentModalShow);

    const closeAssignmentModal = () => {
        setAssignmentModalShow(false);
        setEditContent(null);
    }

    const createAssignment = async (e, formData) => {
        e.stopPropagation();

        const res = await createAssignmentHandler(formData, {
            SectionID: selectedSection.Section_ID, 
            parent_contentID: getContentHead()?.content_id || null
        })

        closeAssignmentModal();
        addToast(`The assignment '${formData.contentName}' ${formData.editContent ? 'updated' : 'added'} successfully!`, 'success', 4000);
        getAllCurrentContents();
    }

    const handleEditContent = (e, content) => {
        e.stopPropagation();
        setEditContent(content);
        handleShow();
    }

    const handleDeleteContent = (e, content) => {
        e.stopPropagation();
        setDeleteContent(content);
    }

    const handleEditExam = (e, content) => {
        e.stopPropagation();
        setEditContent(content);
        toggleAssignmentModal();
    }

    const deleteCourseContent = async (e) => {
        e.stopPropagation();
        let url = URLS.deleteCourseContent;
        let data = {
            content_id: deleteContent.content_id
        }
        if (deleteContent && deleteContent.content_type === "Exam") {
            url = URLS.deleteExam;
            data = {
                ExamID: deleteContent.content_id
            }
            const res = await axiosInstance.delete(url, { data });
        }
        else {
            const res = await axiosInstance.delete(url, { data });
        }
        closeDeletePopup();
        getAllCurrentContents();
        addToast(`The ${deleteContent.content_type === "Exam" ? 'assignment' : 'content'} '${deleteContent.content_name}' deleted successfully!`, 'success', 4000);
    }

    const closeDeletePopup = () => {
        setDeleteContent(null)
    }

    const addToStack = (content) => {
        setContentStack([...contentStack, content]);
    }

    const getContentHead = () => {
        return contentStack[contentStack.length - 1]
    }

    const handleCreateContent = async (e, formData) => {
        e.preventDefault();
        const { value, contentName, contentType, editContent, contentTitleURL, file } = formData;
        const data = {
            content_id: editContent ? editContent.content_id : null,
            course_id: selectedSection.courseID,
            parent_id: getContentHead()?.content_id || null,
            content_type: contentTypes[contentType - 1],
            content_name: contentName,
            content_order: 1,
            content_data: DOMPurify.sanitize(value),
            content_title_link: contentTitleURL || null,
            file: contentType == 4 ? file : null
        }
        let url = URLS.createCourseContent;

        let updatedFlag = 0;
        if (editContent) {
            updatedFlag = 1;
            url = URLS.updateCourseContent
            await axiosInstance.put(url, data, formDataHeaders)
        } else {
            const res = await axiosInstance.post(url, data, formDataHeaders);
        }

        getAllCurrentContents();
        handleCloseModal();
        addToast(`The content '${data.content_name}' ${updatedFlag ? 'updated' : 'added'} successfully!`, 'success', 5000);
    }

    const getAllContentExams = () => {
        if (!selectedSection.Section_ID) return;
        const headContent = getContentHead();
        // if (headContent && headContent?.content_type === "folder") {
            const url = URLS.getAllContentExams;
            const params = {
                sectionId: selectedSection.Section_ID,
                parent_id: headContent?.content_id || null
            }
            axiosInstance.get(url, { params }).then(res => {
                setContentExams(res.data)
            })
        // }
    }

    const getAllCurrentContents = () => {
        if (!selectedSection.courseID) return;
        const headContent = getContentHead();
        if (headContent && headContent.content_type === "Exam") {
            setCurrentContents([]); return;
        }
        const url = URLS.getAllCourseContents;
        const params = {
            courseID: selectedSection.courseID,
            parent_id: headContent?.content_id || null
        }
        axiosInstance.get(url, { params }).then(res => {
            setCurrentContents(res.data)
        })
        getAllContentExams();
    }

    const handleCloseModal = () => {
        setShow(false)
        setEditContent(null);
    }

    useEffect(() => {
        getAllCurrentContents();
    }, [selectedSection.courseID, getContentHead()?.content_id]);

    const headContent = getContentHead();

    return (
        <div className="maxHeight">
            <div className="fs-4 mt-2 mb-3 d-flex justify-content-between align-items-center">
                {
                    headContent?.content_id ? <h5 className={`m-0 py-2 d-flex align-items-center gap-3`}>
                        <button className="navbackbtn px-3 btn btn-link btn-light btn-sm" onClick={popContent}><BackIcon /></button>
                        <div>{headContent.content_name}</div>
                    </h5> : <div>Course Content</div>
                }
                {
                    !isStudent() && (!headContent || headContent?.content_type === "folder") ? (

                                <DropdownButton
                                    id={`dropdown-button-drop`}
                                    size="sm"
                                    variant="primary"
                                    title="Add New"
                                    className="d-flex"
                                >
                                    <Dropdown.Item as="button" onClick={handleShow}>Course Content</Dropdown.Item>
                                    <Dropdown.Item as="button" onClick={toggleAssignmentModal}>Course Assignment</Dropdown.Item>
                                </DropdownButton>
                                ) : ("")
                }
            </div>
            <RenderCourseContents // contents such as 1. files, text, URL Links, folders and Assignments
                contents={currentContents}
                handleEditContent={handleEditContent}
                handleDeleteContent={handleDeleteContent}
                setParentContent={addToStack}
                exams={contentExams || []}
                headContent={headContent || null}
                handleEditExam={handleEditExam}
                handleDeleteExam={handleDeleteContent}
                popContent={popContent}
            />
            <div>
                {/* modals */}
                {
                    AssignmentModalShow && (
                        <NewAssignmentModal
                            show={AssignmentModalShow}
                            onHide={closeAssignmentModal}
                            handleCreateContent={createAssignment}
                            content={editContent}
                        />
                    )
                }
                {
                    deleteContent && (
                        <DeleteContentModal
                            show={deleteContent}
                            content={deleteContent}
                            onHide={closeDeletePopup}
                            handleSubmit={deleteCourseContent}
                        />
                    )
                }
                {
                    show && (
                        <AddCourseContentModal
                            show={show}
                            onHide={handleCloseModal}
                            handleCreateContent={handleCreateContent}
                            content={editContent}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default CourseContentTab;