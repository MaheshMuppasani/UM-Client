import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import AdminProgramSearch from "./adminProgramSearch";
import AdminProgramsTable from "./adminProgramsTable";
import AddProgramModal from "./addProgramModal";
import DeleteContentModal from "../../Course/deleteContentModal";
import { useToast } from "../../../AppToast";

const AdminProgramsPage = (props) => {
    const [programs, setPrograms] = useState([]);
    const [addProgramModal, setAddProgramModal] = useState(false);

    const [selectedDeptId, setSelectedDeptId] = useState(0);
    const [selectedPTypeId, setSelectedPTypeId] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [editProgram, seteditProgram] = useState("");
    const [deleteProgram, setdeleteProgram] = useState(null);

    const { setAppConstants } = useConstants();

    const { addToast } = useToast();

    const toggleAddProgramModal = (e) => {
        e && e.stopPropagation();
        setAddProgramModal(!addProgramModal);
    }

    const closeProgramModal = (e) => {
        e && e.stopPropagation();
        seteditProgram(null);
        toggleAddProgramModal();
    }

    const handleEditProgram = (e, program) => {
        e.stopPropagation();
        seteditProgram(program);
        toggleAddProgramModal();
    }

    const toggleDeleteProgramModal = (e, program = null) => {
        e && e.stopPropagation();
        setdeleteProgram(deleteProgram ? null : program)
    }

    const deleteProgramFromDB = (e) => {
        e && e.stopPropagation()
        let url = URLS.deleteProgram;
        const data = { programId: deleteProgram.ProgramID }

        axiosInstance.delete(url, { data })
            .then(res => {
                addToast(`Program ${deleteProgram.Program_Name} deleted successfully!`, 'success')
                toggleDeleteProgramModal();
                handleSearch();
            })
    }

    const handleSearch = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let url = URLS.getAllPrograms;
        const params = {
            departmentId: selectedDeptId || null,
            programTypeId: selectedPTypeId || null,
            search: searchText || null
        }
        axiosInstance.get(url, { params }).then((res) => {
            setPrograms(res.data)
        })
    }

    useEffect(() => {
        handleSearch();
    }, [selectedDeptId, selectedPTypeId])

    useEffect(() => {
        axiosInstance.get(URLS.getAllConstants)
            .then(data => {
                setAppConstants(data.data)
            }).then(() => handleSearch())
    }, [])

    const programPromptOnDelete = `Are you sure to delete this program? This program and all the data associated with it will be deleted permanently!`

    return (
        <div className="StudentProfile">
            <h2 className="d-flex mb-2 align-items-start gap-3 justify-content-between">
                <p className={`sectionClick fw-lighter`} >Programs</p>
                <Button
                    className={"px-4 btn btn-sm"}
                    onClick={toggleAddProgramModal}
                >Add New Program</Button>
            </h2>
            <div>
                <AdminProgramSearch
                    handleSearch={handleSearch}
                    selectedDeptId={selectedDeptId}
                    setSelectedDeptId={setSelectedDeptId}
                    selectedPTypeId={selectedPTypeId}
                    setSelectedPTypeId={setSelectedPTypeId}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
                <AdminProgramsTable
                    programs={programs}
                    handleEditProgram={handleEditProgram}
                    handleDeleteProgram={toggleDeleteProgramModal}
                />
                <div className="text-end p-2">Total Record Count: {programs.length ? programs.length : 0}</div>
            </div>
            {
                addProgramModal && (
                    <AddProgramModal
                        show={addProgramModal}
                        onHide={closeProgramModal}
                        defaultCourseProps={{ selectedDeptId, selectedPTypeId }}
                        onSubmitSuccess={handleSearch}
                        content={editProgram}
                    />
                )
            }
            {
                deleteProgram && (
                    <DeleteContentModal
                        show={deleteProgram}
                        content={{ content_name: deleteProgram.Program_Name, deletePrompt: programPromptOnDelete, modalTitle: "Delete Program" }}
                        onHide={toggleDeleteProgramModal}
                        handleSubmit={deleteProgramFromDB}
                    />
                )
            }
        </div>);
}

export default AdminProgramsPage;