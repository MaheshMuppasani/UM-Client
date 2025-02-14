import DOMPurify from "dompurify";
import { dateFormat, formatDateToLocaleString, getColorForGrade } from "../../utils/utils";
import RenderContentFiles from "./courseContentfiles";
import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import AssignmentSubmission from "./AssignmentSubmission";
import { Accordion } from "react-bootstrap";
import FacultyGradingArea from "../Faculty/facultyGradingArea";
import { URLS } from "../../assets/urlConstants";
import { useUserRole } from "../../userRole";

const AssignmentViewPage = (props) => {
    const { content, popContent } = props;
    const { isStudent, isFaculty } = useUserRole();
    const { content_data, content_id, ExamDueDate, MaximumScore, IsAttempted, grade_received, graded_on, SectionID, Student_ID } = content;

    const [submissions, setSubmissions] = useState([]);

    const sanitizedHtml = DOMPurify.sanitize(content_data);

    useEffect(() => {
        if (!isStudent() && !Student_ID) return;
        let url = URLS.getSubmission;
        let params = {
            examId: content_id, sectionId: SectionID
        }
        if (!isStudent() && Student_ID) { // not a student and faculty provided student id
            url = URLS.getStudentSubmissions;
            params = { ...params, studentId: Student_ID }
        }
        axiosInstance.get(url, { params }).then(res => {
            setSubmissions(res.data);
        })
    }, [content_id, SectionID])

    const submission = submissions[0];
    const isGradeReceived = grade_received || graded_on;

    const displayFacultyGradeInformation = () => {
        if (isStudent() && !isGradeReceived) return false; // student and grade not received 
        if (isStudent() && isGradeReceived) return true; // student and grade received
        if (!isStudent() && !Student_ID) return false; // faculty and no student id provided
        if (!isStudent() || Student_ID) return true; // faculty or a student id is provided
    }

    return (<div className="d-flex justify-content-center">
        <div className="d-flex w-100" style={{ maxWidth: '1200px' }}>
            <div style={{ width: '330px', position:'sticky', top: 0 }} className="py-2 px-4">
                <h6 className="pb-3 mb-3 border-bottom">Assignment Information</h6>
                <div>Assignment Due Date</div>
                <div className="pb-3 mb-3 border-bottom fw-light">{formatDateToLocaleString(ExamDueDate)}</div>
                {
                    isStudent() ? (
                        <>
                            <div>Attempts</div>
                            <div className="pb-3 mb-3 border-bottom fw-light">{submissions.length ? `0 attempt left | ${submissions.length} submitted` : '1 attempt left'}</div>
                        </>
                    ) : ("")
                }
                {
                    submission ? (
                        <>
                            <div>Last attempted on</div>
                            <div className="pb-3 mb-3 border-bottom d-flex align-items-center gap-2">
                                <div>{formatDateToLocaleString(submission.submitted_date)}</div>
                                {(dateFormat(ExamDueDate) - dateFormat(submission.submitted_date) >= 0 ? <span class="px-3 bg-success-subtle rounded">On Time</span> : <span class="px-3 bg-danger-subtle rounded">Late</span>)}
                            </div>
                        </>
                    ) : ("")
                }
                <div>Grading</div>
                <div className="pb-3 mb-3 border-bottom fw-light d-flex">
                    <div style={{ borderRight: '1px solid lightgray', paddingRight: '10px' }}>Maximum Score</div>
                    <div style={{ paddingLeft: '10px' }}>{MaximumScore} points</div>
                </div>
                {
                    submission ? (
                        <div>
                            <div>Grade Received</div>
                            <div className="pb-3 mb-3 border-bottom fw-light">
                                {
                                    submission?.grade_received ? (<span class="badge px-3 mt-2 fs-6" style={{ backgroundColor: getColorForGrade(submission?.grade_received, MaximumScore) }}>{submission?.grade_received} / {MaximumScore}</span>) : <span className="mx-2 fw-light fst-italic">Not Graded</span>
                                }

                            </div>
                        </div>
                    ) : ("")
                }


            </div>
            <div className="flex-grow-1 py-2 px-5" style={{ flex: 1, borderLeft: '1px solid lightgray' }}>
                {
                    isStudent() || Student_ID ? (
                        <Accordion defaultActiveKey={isGradeReceived ? null : "0"} className="mb-3">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Submission {submission ? "Details" : ""}</Accordion.Header>
                                <Accordion.Body>
                                    <div className="mt-3">
                                        <AssignmentSubmission
                                            submissions={submissions}
                                            exam_id={content_id}
                                            SectionID={SectionID}
                                            cancelSubmission={popContent}
                                        />
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>) : ("")
                }
                {
                    displayFacultyGradeInformation() && (
                        <Accordion defaultActiveKey={"0"}>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Faculty {isGradeReceived || submission?.grade_received ? "Feedback" : "Grading"}</Accordion.Header>
                                <Accordion.Body>
                                    <div className="mt-3">
                                        <FacultyGradingArea
                                            Student_ID={Student_ID}
                                            submissions={submissions}
                                            MaximumScore={MaximumScore}
                                            exam_id={content_id}
                                            SectionID={SectionID}
                                            cancelSubmission={popContent}
                                        />
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    )
                }
                <Accordion className="mt-3" defaultActiveKey={isFaculty() ? "0" : ( isStudent() && IsAttempted ? null : "0" )}>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Assignment Instructions</Accordion.Header>
                        <Accordion.Body>
                            <div className="pb-2">
                                <RenderContentFiles content={content} />
                                <div>{sanitizedHtml && <div className="content-body body mt-2" dangerouslySetInnerHTML={{ __html: sanitizedHtml === "<p><br></p>" ? "" : (sanitizedHtml) }} />}</div>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    </div>);
}

export default AssignmentViewPage;