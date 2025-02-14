import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import AdminCourseTable from "./adminCourseTable";
import AdminCourseSearch from "./adminCourseSearch";
import AddCourseModal from "./AddCourseModal";
import { useConstants } from "../../../constantsProvider";
import DeleteContentModal from "../../Course/deleteContentModal";
import { useToast } from "../../../AppToast";

const AdminCoursePage = (props) => {
    const [courses, setCourses] = useState([]);
    const [addCourseModal, setAddCourseModal] = useState(false);

    const [selectedDeptId, setSelectedDeptId] = useState(0);
    const [selectedPTypeId, setSelectedPTypeId] = useState(0);
    const [selectedProgId, setSelectedProgId] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [editCourse, setEditCourse] = useState(null);
    const [deleteCourse, setDeleteCourse] = useState(null);


    const { constants, setAppConstants } = useConstants();
    const { programs } = constants;

    const { addToast } = useToast();

    const toggleAddCourseModal = (e) => {
        e && e.stopPropagation();
        setAddCourseModal(!addCourseModal);
    }

    const closeCourseModal = (e) => {
        e && e.stopPropagation();
        setEditCourse(null);
        toggleAddCourseModal();
    }

    const handleEditCourse = (e, course) => {
        e.stopPropagation();
        setEditCourse(course);
        toggleAddCourseModal();
    }

    const toggleDeleteCourseModal = (e, course = null) => {
        e && e.stopPropagation();
        setDeleteCourse(deleteCourse ? null : course)
    }

    const deleteCourseFromDB = (e) => {
        e && e.stopPropagation()
        let url = URLS.deleteCourse;
        const data = { Course_ID: deleteCourse.Course_ID }

        axiosInstance.delete(url, { data })
            .then(res => {
                addToast(`Course ${deleteCourse.Course_Name} deleted successfully!`, 'success')
                toggleDeleteCourseModal();
                handleSearch();
            })
    }

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let url = URLS.getAllCourses;
        const params = {
            departmentId: selectedDeptId || null,
            programTypeId: selectedPTypeId || null,
            programId: selectedProgId || null,
            search: searchText || null
        }
        axiosInstance.get(url, { params }).then((res) => {
            setCourses(res.data)
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
        if (selectedDeptId && selectedProgId && selectedDeptId !== programs?.find(p => p.ProgramID === selectedProgId).DepartmentID) {
            setSelectedProgId(null);
        }
    }, [selectedDeptId])

    useEffect(() => {
        if (selectedPTypeId && selectedProgId && selectedPTypeId !== programs?.find(p => p.ProgramID === selectedProgId).ProgramTypeID) {
            setSelectedProgId(null);
        }
    }, [selectedPTypeId])

    useEffect(() => {
        handleSearch();
    }, [selectedDeptId, selectedPTypeId, selectedProgId])

    return (
        <div>
            <div className="StudentProfile">
                <h2 className="d-flex mb-2 align-items-start gap-3 justify-content-between">
                    <p className={`sectionClick fw-lighter`} >Courses</p>
                    <Button className={"px-4 btn btn-sm"} onClick={toggleAddCourseModal}>Add New Course</Button>
                </h2>
                <div>
                    <div>
                        <AdminCourseSearch
                            handleSearch={handleSearch}
                            selectedDeptId={selectedDeptId}
                            setSelectedDeptId={setSelectedDeptId}
                            selectedPTypeId={selectedPTypeId}
                            setSelectedPTypeId={setSelectedPTypeId}
                            selectedProgId={selectedProgId}
                            setSelectedProgId={setSelectedProgId}
                            searchText={searchText}
                            setSearchText={setSearchText}
                        />
                        <AdminCourseTable
                            courses={courses}
                            handleEditCourse={handleEditCourse}
                            handleDeleteCourse={toggleDeleteCourseModal}
                        />
                        <div className="text-end p-2">Total Record Count: {courses.length ? courses.length : 0}</div>
                    </div>
                    {
                        addCourseModal && (
                            <AddCourseModal
                                show={addCourseModal}
                                onHide={closeCourseModal}
                                defaultCourseProps={{ selectedDeptId, selectedProgId, selectedPTypeId }}
                                onSubmitSuccess={handleSearch}
                                content={editCourse}
                            />
                        )
                    }
                    {
                        deleteCourse && (
                            <DeleteContentModal
                                show={deleteCourse}
                                content={{ content_name: deleteCourse.Course_Name }}
                                onHide={toggleDeleteCourseModal}
                                handleSubmit={deleteCourseFromDB}
                            />
                        )
                    }
                </div>
            </div>
        </div>);
}

export default AdminCoursePage;