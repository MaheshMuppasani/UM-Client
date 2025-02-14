import { Button, Dropdown, DropdownButton, Table } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";

const AdminProgramsTable = (props) => {
    const { programs, handleEditProgram, handleDeleteProgram } = props;
    const { constants } = useConstants();

    const { departments, programTypes } = constants;

    return (<div className="table-responsive border mt-4 courseTable">
        <table class="table table-hover">
            <thead className="table-primary" style={{ position: "sticky", top: '0' }}>
                <tr>
                    <th className="table-cell cw-100">Program Name</th>
                    <th className="table-cell">Program Description</th>
                    <th className="table-cell">Department</th>
                    <th className="table-cell cw-100 text-center">Program Type</th>
                    <th className="table-cell">Maximum Credits</th>
                    <th className="table-cell">Action</th>
                </tr>
            </thead>
            <tbody>
                {
                    !programs.length ? (<td colSpan={6} className="fw-light text-center noRecordsPlaceholder">No Records Found</td>) : (
                        programs.map((program) => {
                            const { ProgramID, Program_Name, DepartmentID, ProgramDescription, ProgramTypeID } = program;
                            const { Department_Code = null , Department_Name = null } = departments?.find(d => d.Department_ID === DepartmentID) || {};
                            return (
                                <tr
                                    key={ProgramID}
                                    onClick={e => handleEditProgram(e, program)}
                                >
                                    <td className="table-cell cw-100">{Program_Name}</td>
                                    <td className="table-cell">{ProgramDescription}</td>
                                    <td className="table-cell">{Department_Code} - {Department_Name}</td>
                                    <td className="table-cell cw-100 text-center">{programTypes?.find(pt => pt.ProgramType_ID === ProgramTypeID).ProgramType_Name}</td>
                                    <td className="table-cell">{"-"}</td>
                                    <td className="table-cell">
                                        <DropdownButton
                                            id={`dropdown-button-drop`}
                                            size="sm"
                                            variant="secondary"
                                            title="options"
                                            className="d-flex"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <Dropdown.Item as="button" onClick={e => handleEditProgram(e, program)}>Edit Program</Dropdown.Item>
                                            <Dropdown.Item as="button" className={"btn-danger"} onClick={e => handleDeleteProgram(e, program)}>Delete Program</Dropdown.Item>
                                        </DropdownButton>
                                    </td>
                                </tr>
                            )
                        })
                    )
                }
            </tbody>
        </table>
    </div>);
}

export default AdminProgramsTable;