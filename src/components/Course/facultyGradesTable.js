import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { URLS } from "../../assets/urlConstants";
import { formatDateToLocaleString, getColorForGrade } from "../../utils/utils";
import { MessageIcon } from "../../assets/constants";

const FacultyGradeTable = (props) => {
    const { selectedSection } = props;
    const [exams, setExams] = useState([]);

    const getAllSectionGrades = () => {
        if (!selectedSection?.Section_ID) return;
        const url = URLS.getAllSectionGrades;
        const params = {
            sectionId: selectedSection.Section_ID
        }
        axiosInstance.get(url, { params }).then(res => {
            setExams(res.data)
        })
    }

    useEffect(() => {
        getAllSectionGrades();
    }, [])

    return ( 
        <div className="table-responsive mt-4">
                <table class="table border table-hover align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th style={{ width: '200px' }}>Item Name</th>
                            <th style={{ width: '200px' }}>Due Date</th>
                            <th style={{ width: '200px' }}>Submission Status</th>
                            <th style={{ width: '200px' }}>Grade Status</th>
                            <th style={{ width: '200px' }}>Class Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            exams.map((exam) => {
                                let { ExamID, Title, ExamType, SectionID, ExamDueDate, MaximumScore, Instructions_data, file_id, parent_contentID, Is_active, students_attempted, students_graded, total_students, grades_array } = exam;
                                grades_array = grades_array ? JSON.parse(grades_array) : [];
                                const statusText = students_attempted ? (students_attempted !== total_students ? `${students_attempted} of ${total_students} Submitted` :  'All Submitted') : 'None Attempted';
                                const gradeText = students_graded ? (students_graded !== total_students ? `${students_graded} of ${total_students} Graded` : 'All Graded') : 'None Graded'
                                const classTotal = students_graded && grades_array ? (grades_array.length ? grades_array?.reduce((acc, curr) => acc + curr, 0) : 0) : 0;
                                const classAverage = (classTotal / students_graded).toFixed(2);
                                const classAverageText = students_graded ? (<span class="badge px-3 mt-2 fs-6" style={{ backgroundColor: getColorForGrade(classAverage, MaximumScore) }}>{classAverage} / {MaximumScore}</span>) : ("")
                                
                                return (
                                    <tr key={ExamID}
                                    // onClick={e => handleRowClick(e, exam)}
                                    >
                                        <td>{Title}</td>
                                        <td>{formatDateToLocaleString(ExamDueDate).split(', ')[0]}</td>
                                        <td>{statusText}</td>
                                        <td>{gradeText}</td>
                                        <td>{classAverageText}</td>
                                    </tr>
                                )
                            })
                        }
                        {
                            !exams || !exams.length ? <td colSpan={5} className="fw-lighter text-center">No Assignments Posted Yet</td> : ""
                        }
                    </tbody>
                </table>
            </div>
     );
}
 
export default FacultyGradeTable;