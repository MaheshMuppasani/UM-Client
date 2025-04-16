import { useEffect, useState } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosInstance";
import { dateFormat, formatDateToLocaleString } from "../../../utils/utils";
import { BackIcon } from "../../../assets/constants";
import { setExamDataAsContent } from "../courseAssignments";
import AssignmentViewPage from "../AssignmentViewPage";
import { URLS } from "../../../assets/urlConstants";

const AssignmentSubmissionsTab = (props) => {
    const { selectedSection } = props;

    const [assignmentList, setAssignmentList] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(0);
    const [status, setStatus] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [exam, setExam] = useState(null);

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let url = URLS.getAllStudentSubmissions;
        const params = {
            sectionId: selectedSection.Section_ID,
            examId: selectedAssignment || null,
            status: status || null,
            searchText
        }
        axiosInstance.get(url, { params }).then((res) => {
            setSubmissions(res.data)
        })
    }

    useEffect(() => {
        if (!selectedSection.Section_ID) return;
        let url = URLS.getAllSectionAssignments
        let params = {
            sectionId: selectedSection.Section_ID
        }
        axiosInstance.get(url, { params }).then(res => {
            setAssignmentList(res.data);
        })

        handleSearch();

    }, [selectedSection.Section_ID, exam, selectedAssignment, status])

    const handleRowClick = (e, submission) => {
        e.stopPropagation();
        const { ExamID, Student_ID, StudentFullName } = submission;
        const params = {
            sectionId: selectedSection.Section_ID,
            examId: ExamID,
        }
        let url = URLS.getExamDetails;
        axiosInstance.get(url, { params }).then((res) => {
            setExam({ ...setExamDataAsContent(res.data), Student_ID, StudentFullName })
        })
    }

    const popContent = (e) => {
        e.stopPropagation();
        setExam(null);
    }

    return (
        <div className="maxHeight">
            {
                exam ? (
                    <div className="maxHeight">
                        <div className="fs-4 mt-3 mb-4 d-flex justify-content-between align-items-center">
                            {
                                <h5 className={`m-0 d-flex align-items-center gap-3`}>
                                    <button className="navbackbtn px-3 btn btn-link btn-light btn-sm" onClick={popContent}><BackIcon /></button>
                                    <div>{exam.content_name} (Submitted By: {exam.StudentFullName})</div>
                                </h5>
                            }
                        </div>
                        <div className="maxHeight">
                            <AssignmentViewPage
                                content={exam}
                                popContent={popContent}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="maxHeight">
                        <div className="fs-4 my-2 mb-3 d-flex justify-content-between align-items-center">
                            <div>Assignment Submissions</div>
                        </div>
                        <div className="maxHeight">
                            <div>
                                <Form>
                                    <Form.Group
                                        className="mb-3 d-flex align-items-end gap-4"
                                        controlId="exampleForm.ControlTextarea1"
                                    >
                                        <div style={{ minWidth: '250px' }}>
                                            <Form.Label>Select an assignment</Form.Label>
                                            <Form.Select value={selectedAssignment} onChange={e => setSelectedAssignment(Number(e.target.value))}>
                                                <option value={0}>Select an assignment</option>
                                                {
                                                    assignmentList.map(a => <option key={a.ExamID} value={a.ExamID}>{a.Title}</option>)
                                                }
                                            </Form.Select>
                                        </div>

                                        <div style={{ width: '200px' }}>
                                            <Form.Label>Select a status</Form.Label>
                                            <Form.Select value={status} onChange={e => setStatus(Number(e.target.value))}>
                                                <option value={0}>All</option>
                                                <option value={1}>Graded</option>
                                                <option value={2}>Not Graded</option>
                                            </Form.Select>
                                        </div>
                                        <div style={{ width: '500px' }}>
                                            <Form.Label>Search for students</Form.Label>
                                            <Form.Control type="text" placeholder="Search by student name, email, assignment title" value={searchText} onChange={e => setSearchText(e.target.value)} />
                                        </div>
                                        <div>
                                            <Button type="submit" className="px-4" onClick={handleSearch} onSubmit={handleSearch}>Search</Button>
                                        </div>
                                    </Form.Group>
                                </Form>
                            </div>
                            <div className="table-responsive mt-2 maxHeight border">
                                <table className="table border table-hover">
                                    <thead className="table-primary" style={{position:"sticky", top: '-2px', cursor: 'pointer'}}>
                                        <tr>
                                            <th style={{ width: '200px' }}>Student Name</th>
                                            <th style={{ width: '200px' }}>Assignment</th>
                                            <th style={{ width: '200px' }}>Student Email</th>
                                            <th style={{ width: '200px' }}>Due Date</th>
                                            <th style={{ width: '200px' }}>Submitted On</th>
                                            <th style={{ width: '200px' }}>Submission Status</th>
                                            <th style={{ width: '200px' }}>Maximum Points</th>
                                            <th style={{ width: '200px' }}>Student Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* <p className="fw-light">No Records Found</p> */}
                                        {
                                            submissions.map((submission) => {
                                                const { ExamID, submission_id, ExamTitle, StudentFullName, StudentEmail, ExamDueDate, SubmissionDate, GradeReceived, MaximumScore } = submission;
                                                return (
                                                    <tr key={submission_id} onClick={e => handleRowClick(e, submission)} style={{cursor: 'pointer'}}>
                                                        <td>{StudentFullName}</td>
                                                        <td>{ExamTitle}</td>
                                                        <td>{StudentEmail}</td>
                                                        <td>{formatDateToLocaleString(ExamDueDate)}</td>
                                                        <td>{formatDateToLocaleString(SubmissionDate)}</td>
                                                        <td>{(dateFormat(ExamDueDate) - dateFormat(SubmissionDate) >= 0 ? <span className="px-2 bg-success-subtle rounded">On Time</span> : <span className="px-2 bg-danger-subtle rounded">Late</span>)}</td>
                                                        <td>{MaximumScore}</td>
                                                        <td>{GradeReceived || <span className="fw-light px-2 bg-warning-subtle rounded">Not Graded</span>}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        {
                                            !submissions || !submissions.length ? <td colSpan={8} className="fw-lighter text-center">No Records Found</td> : ""
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
}

export default AssignmentSubmissionsTab;