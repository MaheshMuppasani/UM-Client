import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { URLS } from "../../assets/urlConstants";
import { formatDateToLocaleString, getColorForGrade } from "../../utils/utils";
import { MessageIcon } from "../../assets/constants";

const StudentGradesTable = (props) => {
    const { selectedSection } = props;
    const [exams, setExams] = useState([]);

    const getAllTeachingSeactionExams = () => {
        if (!selectedSection?.Section_ID) return;
        const url = URLS.getAllTeachingSectionExams;
        const params = {
            sectionId: selectedSection.Section_ID,
            parent_id: null
        }
        axiosInstance.get(url, { params }).then(res => {
            setExams(res.data)
        })
    }

    useEffect(() => {
        getAllTeachingSeactionExams();
    }, [])

    return ( 
        <div className="table-responsive mt-3">
                <table className="table border table-hover align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th style={{ width: '200px' }}>Item Name</th>
                            <th style={{ width: '200px' }}>Due Date</th>
                            <th style={{ width: '200px' }}>Status</th>
                            <th style={{ width: '200px' }}>Grade</th>
                            <th style={{ width: '200px' }}>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            exams.map((exam) => {
                                const { ExamID, Title, hasAFeedback, ExamDueDate, MaximumScore, IsAttempted, grade_received, graded_on } = exam;
                                const isSubmitted = IsAttempted;
                                const statusText = graded_on ? 'Graded' : (isSubmitted ? 'Submitted' : 'Not Submitted');
                                const gradeText = graded_on ? (<span className="badge px-3 mt-2 fs-6" style={{ backgroundColor: getColorForGrade(grade_received, MaximumScore) }}>{grade_received} / {MaximumScore}</span>) : <span className="mx-2 fw-light fst-italic">Not Graded</span>
                                return (
                                    <tr key={ExamID}
                                    >
                                        <td>{Title}</td>
                                        <td>{formatDateToLocaleString(ExamDueDate).split(', ')[0]}</td>
                                        <td>{statusText}</td>
                                        <td>{gradeText}</td>
                                        <td className="text-primary">{hasAFeedback ? <MessageIcon /> : ""}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
     );
}
 
export default StudentGradesTable;