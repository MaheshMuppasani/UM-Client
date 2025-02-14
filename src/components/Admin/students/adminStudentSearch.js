import { Button, Form } from "react-bootstrap";
import { renderPrograms } from "../../Student/studentRegistration";
import { useConstants } from "../../../constantsProvider";

const AdminStudentSearch = (props) => {
    const { handleSearch, selectedPTypeId, 
        setSelectedPTypeId, selectedProgId, setSelectedProgId, searchText, setSearchText } = props;
    const { constants } = useConstants();
    const { programs, programTypes } = constants;

    return (<div>
        <Form>
            <Form.Group
                className="mb-3 d-flex align-items-end gap-4"
                controlId="exampleForm.ControlTextarea1"
            >
                <div style={{ minWidth: '250px' }}>
                </div>
                <div style={{ width: '200px' }}>
                    <Form.Select
                        value={selectedPTypeId}
                        onChange={e => setSelectedPTypeId(Number(e.target.value))}
                    >
                        <option value={0}>Select program type</option>
                        {
                            programTypes?.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)
                        }
                    </Form.Select>
                </div>
                <div style={{ width: '200px' }}>
                    <Form.Select
                        value={selectedProgId}
                        onChange={e => setSelectedProgId(Number(e.target.value))}
                    >
                        <option value={0}>Select program</option>
                        {
                            renderPrograms(programs, selectedPTypeId)
                        }
                    </Form.Select>
                </div>
                <div style={{ width: '500px' }}>
                    <Form.Control
                        type="text"
                        placeholder="Search by course name"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <div>
                    <Button className="px-3" type="submit" onClick={handleSearch}>Search</Button>
                </div>

            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea2">
            </Form.Group>
        </Form>
    </div>);
}

export default AdminStudentSearch;