import { Button, Dropdown, DropdownButton, Table } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { useHistory, useRouteMatch } from "react-router-dom";

const AdminCourseTable = (props) => {
    const { courses, handleEditCourse, handleDeleteCourse } = props;
    const { constants } = useConstants();
    const history = useHistory();
    const { path } = useRouteMatch();

    const { departments, programs, programTypes } = constants;

    return (<div className="table-responsive border mt-4 courseTable">
        <table className="table table-hover">
            <thead className="table-primary" style={{ position: "sticky", top: '0' }}>
                <tr>
                    <th className="table-cell cw-100">Course Code</th>
                    <th className="table-cell">Course Name</th>
                    <th className="table-cell">Description</th>
                    <th className="table-cell cw-100 text-center">Credits</th>
                    <th className="table-cell">Department</th>
                    <th className="table-cell">Program</th>
                    <th className="table-cell">Program Type</th>
                    <th className="table-cell">Sections</th>
                    <th className="table-cell">Action</th>
                </tr>
            </thead>
            <tbody>
                {
                    !courses.length ? (<td colSpan={7} className="fw-light text-center noRecordsPlaceholder">No Records Found</td>) : (
                        courses.map((course) => {
                            const { ProgramTypeID, Department_ID, Course_ID, course_code, Course_Name, Course_Description, Course_ProgramID, CreditHours, Is_active } = course;
                            return (
                                <tr
                                    key={Course_ID}
                                    onClick={e => history.push(`${path}/${Course_ID}`)}
                                >
                                    <td className="table-cell cw-100">{course_code}</td>
                                    <td className="table-cell">{Course_Name}</td>
                                    <td className="table-cell">{Course_Description}</td>
                                    <td className="table-cell cw-100 text-center">{CreditHours}</td>
                                    <td className="table-cell">{departments?.find(d => d.Department_ID === Department_ID).Department_Name}</td>
                                    <td className="table-cell">{programs?.find(d => d.ProgramID === Course_ProgramID).Program_Name}</td>
                                    <td className="table-cell">{programTypes?.find(pt => pt.ProgramType_ID === ProgramTypeID).ProgramType_Name}</td>
                                    <td className="table-cell">-</td>
                                    <td className="table-cell">
                                        <DropdownButton
                                            id={`dropdown-button-drop`}
                                            size="sm"
                                            variant="secondary"
                                            title="options"
                                            className="d-flex"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <Dropdown.Item as="button" onClick={e => handleEditCourse(e, course)}>Quick Edit Course</Dropdown.Item>
                                            <Dropdown.Item as="button" className={"btn-danger"} onClick={e => handleDeleteCourse(e, course)}>Delete Course</Dropdown.Item>
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

export default AdminCourseTable;