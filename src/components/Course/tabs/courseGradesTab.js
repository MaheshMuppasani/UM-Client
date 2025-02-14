import { Button } from "react-bootstrap";
import { useUserRole } from "../../../userRole";
import FacultyGradeTable from "../facultyGradesTable";
import StudentGradesTable from "../studentGradesTable";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useToast } from "../../../AppToast";


const CourseGradesTab = (props) => {
    const { selectedSection } = props;
    const { addToast } = useToast();
    const { isStudent, isFaculty } = useUserRole();

    const handlePostAllGrades = (e) => {
        e.stopPropagation();
        if(!selectedSection?.Section_ID) return;
        let url = URLS.postAllSectionGrades;
        const data = {
            sectionId: selectedSection.Section_ID
        }
        axiosInstance.put(url, data).then(res => {
            addToast(res.data, 'success')
        }).catch(err => {
            addToast(err.data, 'danger')
        })
    }

    return (
        <div>
            <div className="fs-4 mt-2 mb-4 d-flex justify-content-between align-items-center">
                <div>Grades</div>
                {
                    isFaculty() ? (<Button className="btn-sm" onClick={handlePostAllGrades}>Post All Grades</Button>) : ("")
                }
            </div>
            {
                isStudent() ? (
                    <StudentGradesTable selectedSection={selectedSection} />
                ) : ("")
            }
            {
                isFaculty() ? (
                    <FacultyGradeTable selectedSection={selectedSection} />
                ) : ("")
            }
        </div>
    )
}

export default CourseGradesTab;