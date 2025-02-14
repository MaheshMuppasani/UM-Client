import DOMPurify from "dompurify";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { ContentFileIcons, contentTypes } from "../../assets/constants";
import CourseAssignments from "./courseAssignments";
import { isNoContentBody, RenderContentBody } from "./tabs/courseContentTab";
import RenderContentFiles from "./courseContentfiles";
import AssignmentViewPage from "./AssignmentViewPage";
import { useUserRole } from "../../userRole";

export function truncateContent(content, maxLength = 750) {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
}

const RenderCourseContents = (props) => {
    const { contents,
        exams,
        headContent,
        popContent,
        handleDeleteContent, handleEditContent, setParentContent, handleEditExam, handleDeleteExam } = props;
    const { isStudent } = useUserRole();

    const handleHeaderClick = (e, content) => {
        e.stopPropagation();
        setParentContent(content);
    }
    return (
        <div className="maxHeight">
            {
                headContent?.content_type === "Exam" ? (
                    <AssignmentViewPage content={headContent} popContent={popContent} />
                ) : (
                    <div>
                        <div>
                            {
                                headContent && <RenderContentBody contents={headContent} />
                            }
                        </div>
                        <div>
                            {
                                (contents && contents.length) ? contents.map(content => {
                                    const { content_id, parent_id, content_type, content_name, content_order, content_data, content_title_link } = content;
                                    const sanitizedHtml = DOMPurify.sanitize(content_data);
                                    const ContentIcon = ContentFileIcons[contentTypes.findIndex(ct => ct === content_type)]

                                    return <div className="courseContent px-4 py-4 border rounded border-secondary-subtle" key={content_id}>
                                        <div className="courseContentHeader d-flex gap-4">
                                            <ContentIcon />
                                            <div className={`d-flex gap-5 flex-grow-1 justify-content-between`}>
                                                {
                                                    content_type === "text with title link" ? (
                                                        <h5
                                                            className={`clickLink`}>
                                                            <a href={content_title_link} target="_blank">{content_name}</a>
                                                        </h5>
                                                    ) : (
                                                        <h5
                                                            className={`clickLink ${content_type !== "text with title link" ? '' : ''}`}
                                                            onClick={e => handleHeaderClick(e, content)}>
                                                            {content_name}
                                                        </h5>
                                                    )
                                                }
                                                {
                                                    !isStudent() && (
                                                        <div className="d-flex gap-3 align-items-baseline">
                                                            <DropdownButton
                                                                id={`dropdown-button-drop`}
                                                                size="sm"
                                                                variant="secondary"
                                                                title="Options"
                                                            >
                                                                <Dropdown.Item as="button" onClick={(e) => handleEditContent(e, content)}>Edit Content</Dropdown.Item>
                                                                <Dropdown.Item as="button" onClick={(e) => handleDeleteContent(e, content)}>Delete Content</Dropdown.Item>
                                                            </DropdownButton>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        {sanitizedHtml && <div className="content-body body mt-2" dangerouslySetInnerHTML={{ __html: sanitizedHtml === "<p><br></p>" ? "" : truncateContent(sanitizedHtml) }} />}
                                    </div>
                                }) : (
                                    (headContent?.content_type === "file" && <RenderContentFiles content={headContent} />)
                                )
                            }
                        </div>
                        <CourseAssignments
                            exams={exams}
                            setParentContent={setParentContent}
                            handleEditContent={handleEditExam}
                            handleDeleteContent={handleDeleteExam}
                        />
                        {
                            isNoContentBody(headContent) && // no content body for head content
                            (!contents || !contents?.length) && // no contents either for head content
                            (!exams || !exams?.length) &&  // no exams for head content
                            (headContent?.content_type !== 'file') &&
                            (<div className="fw-lighter text-center">No Contents Here</div>)
                        }
                    </div>
                )
            }
        </div>
    )
}

export default RenderCourseContents;