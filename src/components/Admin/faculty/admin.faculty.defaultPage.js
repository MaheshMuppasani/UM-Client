import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useConstants } from "../../../constantsProvider";
import DeleteContentModal from "../../Course/deleteContentModal";
import { useToast } from "../../../AppToast";
import AdminFacultySearch from "./admin.faculty.search";
import AdminFacultyTable from "./admin.faculty.table";
import AddFacultyModal from "./admin.faculty.modal";

const AdminFacultyPage = (props) => {
    const [faculties, setFaculty] = useState([]);
    const [addFacultyModal, setAddFacultyModal] = useState(false);

    const [selectedDeptId, setSelectedDeptId] = useState(0);
    // const [selectedProgId, setSelectedProgId] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [editFaculty, setEditFaculty] = useState(null);
    const [deleteFaculty, setDeleteFaculty] = useState(null);


    const { constants, setAppConstants } = useConstants();
    // const { programs } = constants;

    const { addToast } = useToast();

    const toggleAddFacultyModal = (e) => {
        e && e.stopPropagation();
        setAddFacultyModal(!addFacultyModal);
    }

    const closeFacultyModal = (e) => {
        e && e.stopPropagation();
        setEditFaculty(null);
        toggleAddFacultyModal();
    }

    const handleEditFaculty = (e, course) => {
        e.stopPropagation();
        setEditFaculty(course);
        toggleAddFacultyModal();
    }

    const toggleDeleteFacultyModal = (e, course = null) => {
        e && e.stopPropagation();
        setDeleteFaculty(deleteFaculty ? null : course)
    }

    const submitDeleteFaculty = (e) => {
        e && e.stopPropagation()
        let url = URLS.deleteFaculty;
        const data = { 
            Faculty_ID: deleteFaculty.Faculty_ID 
        }

        axiosInstance.delete(url, { data })
            .then(res => {
                addToast(`Faculty ${deleteFaculty.FacultyName} removed successfully!`, 'success')
                toggleDeleteFacultyModal();
                handleSearch();
            })
    }

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let url = URLS.getAllFaculty;
        const params = {
            departmentId: selectedDeptId || null,
            search: searchText || null
        }
        axiosInstance.get(url, { params }).then((res) => {
            setFaculty(res.data)
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
        handleSearch();
    }, [selectedDeptId])

    return (
        <div>
            <div className="StudentProfile">
                <h2 className="d-flex mb-2 align-items-start gap-3 justify-content-between">
                    <p className={`sectionClick fw-lighter`} >Faculty</p>

                    <Button className={"px-4 btn btn-sm"} onClick={toggleAddFacultyModal}>Add New Faculty</Button>
                </h2>
                <div>
                    <div>
                        <AdminFacultySearch
                            handleSearch={handleSearch}
                            selectedDeptId={selectedDeptId}
                            setSelectedDeptId={setSelectedDeptId}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            selectedDesignationId={0}
                            setSelectedDesignationId={() => {}}
                        />
                        <AdminFacultyTable
                            faculties={faculties}
                            handleEditFaculty={handleEditFaculty}
                            handleDeleteFaculty={toggleDeleteFacultyModal}
                        />
                        <div className="text-end p-2">Total Record Count: {faculties.length ? faculties.length : 0}</div>
                    </div>
                    {
                        addFacultyModal && (
                            <AddFacultyModal
                                show={addFacultyModal}
                                onHide={closeFacultyModal}
                                defaultFacultyProps={{ selectedDeptId }}
                                onSubmitSuccess={handleSearch}
                                content={editFaculty}
                            />
                        )
                    }
                    {/* {
                        deleteFaculty && (
                            <DeleteContentModal
                                show={deleteFaculty}
                                content={{ content_name: deleteFaculty.Course_Name }}
                                onHide={toggleDeleteFacultyModal}
                                handleSubmit={submitDeleteFaculty}
                            />
                        )
                    } */}
                </div>
            </div>
        </div>);
}

export default AdminFacultyPage;