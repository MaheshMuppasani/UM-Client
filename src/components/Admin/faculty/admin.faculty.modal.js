import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useToast } from "../../../AppToast";

const designations = {
    'Lecturer': 'Lecturer',
    'Assistant Professor': 'Assistant Professor',
    'Associate Professor': 'Associate Professor',
    'Professor': 'Professor',
    'Doctor': 'Doctor'
}

const AddFacultyModal = (props) => {
    const { defaultFacultyProps, onSubmitSuccess, content } = props;
    const { constants } = useConstants();
    const { addToast } = useToast();

    const { departments, programTypes } = constants;
    let designationIndex = (content?.Designation && (Object.values(designations).findIndex(d => d===content.Designation)));

    const [selectedDeptId, setSelectedDeptId] = useState(content ? (content.DepartmentID) : (defaultFacultyProps?.selectedDeptId || 0));
    const [fName, setFName] = useState(content?.FirstName || "");
    const [lName, setLName] = useState(content?.LastName || "");
    const [email, setEmail] = useState(content?.Email || "");
    const [phone, setPhone] = useState(content?.Phone || "");
    const [education, setEducation] = useState(content?.Education || "");
    const [designation, setDesignation] = useState((designationIndex!==-1 && (designationIndex+1)) || 0 );
    const [password, setPassword] = useState("");
    const [confirmPW, setConfirmPW] = useState("");

    const handleSubmit = (e) => {
        let url = content ? URLS.editFaculty : URLS.addNewFaculty;
        const data = {
            Faculty_ID: content ? content.Faculty_ID : null,
            FirstName: fName,
            LastName: lName,
            DepartmentID: selectedDeptId || null,
            Email: email,
            Phone: phone,
            Education: education || null,
            password: password || null,
            confirmPW: confirmPW || null,
            Designation: designation ? Object.values(designations)[designation - 1] : null,
            Faculty_ID: content ? content.Faculty_ID : null
        }
        if(content){
            axiosInstance.put(url, data).then(res => {
                addToast(`Faculty ${fName}, ${lName} updated successfully!`, 'success')
                props.onHide();
                onSubmitSuccess();
            }).catch(err => {
                addToast(`Unexpected error: ${err?.data || ""}`, 'danger');
            })
        } else{
            axiosInstance.post(url, data).then(res => {
                addToast(`Faculty ${fName}, ${lName} added successfully!`, 'success');
                props.onHide();
                onSubmitSuccess();
            }).catch(err => {
                addToast(`Unexpected error: ${err?.data || ""}`, 'danger');
            })
        }
    }

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                {content ? "Edit": "Add New"} Faculty
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseForm">
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. John"
                                value={fName}
                                onChange={e => setFName(e.target.value)}
                            />
                        </div>
                        <div className="w-50">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Abraham"
                                value={lName}
                                onChange={e => setLName(e.target.value)}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="e.g. john@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="w-50">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. +19899999999"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Department</Form.Label>
                            <Form.Select value={selectedDeptId}
                                onChange={e => setSelectedDeptId(Number(e.target.value))}>
                                <option value={0}>Select Department</option>
                                {
                                    departments?.map(d => <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name} [{d.Department_Code}]</option>)
                                }
                            </Form.Select>
                        </div>
                        <div className="flex-grow-1">
                            <Form.Label>Select A Designation</Form.Label>
                            <Form.Select 
                                value={designation}
                                onChange={e => setDesignation(Number(e.target.value))}
                                >
                                <option value={0}>Select a designation</option>
                                {
                                    Object.values(designations).map((d, i) => {
                                        return <option key={i+1} value={i+1}>{d}</option>
                                    })
                                }
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 gap-3" controlId="exampleForm.ControlInput1">
                        <div>
                            <Form.Label>Education</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. MSc in Biology"
                                value={education}
                                onChange={e => setEducation(e.target.value)}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="mb-3 d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="w-50">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPW}
                                onChange={e => setConfirmPW(e.target.value)}
                            />
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{content ? "Edit": "Add New"} Faculty</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddFacultyModal;