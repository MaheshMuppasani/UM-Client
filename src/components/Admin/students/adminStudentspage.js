import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import AdminCourseTable from "./adminCourseTable";
import AdminCourseSearch from "./adminCourseSearch";
import AddCourseModal from "./AddCourseModal";
import { useConstants } from "../../../constantsProvider";
import { useToast } from "../../../AppToast";
import AdminStudentSearch from "./adminStudentSearch";

const AdminStudentPage = (props) => {
    const [students, setStudents] = useState([]);
    const [passwordResetModal, setPasswordResetModal] = useState(false);

    const [selectedPTypeId, setSelectedPTypeId] = useState(0);
    const [selectedProgId, setSelectedProgId] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [editStudent, setEditStudent] = useState(null);
    const [deleteStudent, setDeleteStudent] = useState(null);


    const { constants, setAppConstants } = useConstants();
    const { programs } = constants;

    const { addToast } = useToast();

    const toggleAddCourseModal = (e) => {
        e && e.stopPropagation();
        setPasswordResetModal(!passwordResetModal);
    }

    const closePasswordResetModal = (e) => {
        e && e.stopPropagation();
        setEditStudent(null);
        toggleAddCourseModal();
    }

    const handleEditStudent = (e, course) => {
        e.stopPropagation();
        setEditStudent(course);
        toggleAddCourseModal();
    }

    const toggleDeleteStudentModal = (e, course = null) => {
        e && e.stopPropagation();
        setDeleteStudent(deleteStudent ? null : course)
    }

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let url = URLS.getAllCourses;
        const params = {
            programTypeId: selectedPTypeId || null,
            programId: selectedProgId || null,
            search: searchText || null
        }
        axiosInstance.get(url, { params }).then((res) => {
            setStudents(res.data)
        })
    }

    useEffect(() => {
        axiosInstance.get(URLS.getAllConstants)
            .then(data => {
                setAppConstants(data.data)
            }).then(() => {
                handleSearch();
            })
    }, [])

    useEffect(() => {
        if (selectedPTypeId && selectedProgId && selectedPTypeId !== programs?.find(p => p.ProgramID === selectedProgId).ProgramTypeID) {
            setSelectedProgId(null);
        }
    }, [selectedPTypeId])

    useEffect(() => {
        handleSearch();
    }, [selectedPTypeId, selectedProgId])

    return (
        <div>
            <div className="StudentProfile">
                <h2 className="d-flex mb-2 align-items-start gap-3 justify-content-between">
                    <p className={`sectionClick fw-lighter`} >Students</p>
                    {/* <Button className={"px-4 btn btn-sm"} onClick={toggleAddCourseModal}>Add New Course</Button> */}
                </h2>
                <div>
                    <div>
                        <AdminStudentSearch
                            handleSearch={handleSearch}
                            selectedPTypeId={selectedPTypeId}
                            setSelectedPTypeId={setSelectedPTypeId}
                            selectedProgId={selectedProgId}
                            setSelectedProgId={setSelectedProgId}
                            searchText={searchText}
                            setSearchText={setSearchText}
                        />
                        <AdminCourseTable
                            students={students}
                            handleEditStudent={handleEditStudent}
                            handleDeleteStudent={toggleDeleteStudentModal}
                        />
                        <div className="text-end p-2">Total Record Count: {students.length ? students.length : 0}</div>
                    </div>
                    {
                        passwordResetModal && (
                            <AddCourseModal
                                show={passwordResetModal}
                                onHide={closePasswordResetModal}
                                defaultCourseProps={{ selectedProgId, selectedPTypeId }}
                                onSubmitSuccess={handleSearch}
                                content={editStudent}
                            />
                        )
                    }
                </div>
            </div>
        </div>);
}

export default AdminStudentPage;