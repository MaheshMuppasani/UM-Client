import { Button, Dropdown, DropdownButton, Table } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { useHistory, useRouteMatch } from "react-router-dom";

const AdminFacultyTable = (props) => {
    const { faculties, handleEditFaculty, handleDeleteFaculty } = props;
    const { constants } = useConstants();
    const history = useHistory();
    const { path } = useRouteMatch();

    const { departments } = constants;

    return (<div className="table-responsive border mt-4 courseTable">
        <table className="table table-hover">
            <thead className="table-primary" style={{ position: "sticky", top: '0' }}>
                <tr>
                    <th className="table-cell cw-100">Faculty Name</th>
                    <th className="table-cell">Department</th>
                    <th className="table-cell">Designation</th>
                    <th className="table-cell cw-100 text-center">Email</th>
                    <th className="table-cell">Phone</th>
                    <th className="table-cell">Action</th>
                </tr>
            </thead>
            <tbody>
                {
                    !faculties.length ? (<td colSpan={7} className="fw-light text-center noRecordsPlaceholder">No Records Found</td>) : (
                        faculties.map((faculty) => {
                            const { Faculty_ID, FirstName, LastName, DepartmentID, Designation, Email, Phone, FacultyName } = faculty;
                            return (
                                <tr
                                    key={Faculty_ID}
                                    onClick={e => handleEditFaculty(e, faculty)}
                                >
                                    <td className="table-cell cw-100">{FacultyName}</td>
                                    <td className="table-cell">{departments?.find(d => d.Department_ID === DepartmentID).Department_Name}</td>
                                    <td className="table-cell">{Designation}</td>
                                    <td className="table-cell cw-100 text-center">{Email}</td>
                                    <td className="table-cell">{Phone}</td>
                                    <td className="table-cell">
                                        <DropdownButton
                                            id={`dropdown-button-drop`}
                                            size="sm"
                                            variant="secondary"
                                            title="options"
                                            className="d-flex"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <Dropdown.Item as="button" onClick={e => handleEditFaculty(e, faculty)}>Quick Edit Faculty</Dropdown.Item>
                                            <Dropdown.Item as="button" className={"btn-danger"} onClick={e => handleDeleteFaculty(e, faculty)}>Remove Faculty</Dropdown.Item>
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

export default AdminFacultyTable;