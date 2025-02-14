import { Dropdown, DropdownButton } from "react-bootstrap";
import DOMPurify from "dompurify";
import { CheckIcon, ContentFileIcons, contentTypes } from "../../assets/constants";
import { formatDateToLocaleString } from "../../utils/utils";
import { truncateContent } from "./courseContents";
import { useUserRole } from "../../userRole";

export const setExamDataAsContent = (exam) => {
    const { ExamID, Title, Instructions_data, parent_contentID } = exam;
    const content = {
        content_data: Instructions_data,
        content_id: ExamID,
        content_name: Title,
        content_order: null,
        content_title_link: null,
        content_type: 'Exam',
        parent_id: parent_contentID,
        ...exam
    }
    return content;
}

const CourseAssignments = (props) => {
    const { exams, handleDeleteContent, handleEditContent, setParentContent } = props;

    const { isStudent } = useUserRole();

    const handleHeaderClick = (e, exam) => {
        e.stopPropagation();
        setParentContent(setExamDataAsContent(exam));
    }

    const deleteExam = (e, exam) => {
        handleDeleteContent(e, setExamDataAsContent(exam))
    }
    return (
        <div>
            {
                exams.map(exam => {
                    const { ExamID, Title, ExamDueDate, Instructions_data, Is_active, IsAttempted, grade_received, graded_on } = exam;
                    const sanitizedHtml = DOMPurify.sanitize(Instructions_data);
                    const ContentIcon = ContentFileIcons[contentTypes.findIndex(ct => ct === "Exam")];

                    return <div className="courseContent px-4 py-4 border rounded border-secondary-subtle" key={ExamID}>
                        <div className="courseContentHeader d-flex gap-4">
                            <ContentIcon />
                            <div className={`d-flex gap-5 flex-grow-1 justify-content-between`}>
                                <div className="d-flex align-items-center gap-2 mb-2 flex-grow-1">
                                    <h5
                                        className={`clickLink mb-0`}
                                        onClick={e => handleHeaderClick(e, exam)}>
                                        {Title} </h5>
                                    {IsAttempted ? <span title="Submitted"><CheckIcon style={{ width: "20px", height: "20px", color: 'green' }} /></span> : ""}
                                    <div style={{marginLeft: 'auto'}} className="px-4 bg-success-subtle rounded">{grade_received ? 'Graded' : ""}</div>
                                </div>
                                {
                                    !isStudent() && (
                                        <div className="d-flex gap-3 align-items-baseline">
                                            <DropdownButton
                                                id={`dropdown-button-drop`}
                                                size="sm"
                                                variant="secondary"
                                                title="Options"
                                            >
                                                <Dropdown.Item as="button" onClick={(e) => handleEditContent(e, exam)}>Edit Assignment</Dropdown.Item>
                                                <Dropdown.Item as="button" onClick={(e) => deleteExam(e, exam)}>Delete Assignment</Dropdown.Item>
                                            </DropdownButton>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div><span>Due Date:</span> {formatDateToLocaleString(ExamDueDate)}</div>
                        {sanitizedHtml && <div className="content-body body mt-2" dangerouslySetInnerHTML={{ __html: sanitizedHtml === "<p><br></p>" ? "" : truncateContent(sanitizedHtml) }} />}
                    </div>
                })
            }
        </div>
    );
}

export default CourseAssignments;