import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useToast } from "../../../AppToast";

const AddProgramModal = (props) => {
    const { defaultCourseProps, onSubmitSuccess, content } = props;
    const { constants } = useConstants();
    const { addToast } = useToast();

    const { departments, programTypes } = constants;
    const [selectedDeptId, setSelectedDeptId] = useState(content ? (content.DepartmentID) : (defaultCourseProps?.selectedDeptId || 0));
    const [selectedPTypeId, setSelectedPTypeId] = useState(content ? (content.ProgramTypeID) : (defaultCourseProps?.selectedPTypeId || 0));
    const [title, setTitle] = useState(content ? (content.Program_Name) : "");
    const [description, setDescription] = useState(content ? (content.ProgramDescription) : "");

    const handleSubmit = (e) => {
        let url = content ? URLS.editProgram : URLS.addNewProgram;
        const data = {
            ProgramID: content ? content.ProgramID : null,
            Program_Name: title,
            ProgramDescription: description || null,
            DepartmentID: selectedDeptId || null,
            ProgramTypeID: selectedPTypeId || null
        }
        if(content){
            axiosInstance.put(url, data).then(res => {
                addToast(`Program ${title} updated successfully!`, 'success');
                props.onHide();
                onSubmitSuccess();
            }).catch(err => {
                addToast(`Unexpected error: ${err.data}`, 'danger');
            })
        } else{
            axiosInstance.post(url, data).then(res => {
                addToast(`Program ${title} added successfully!`, 'success');
                props.onHide();
                onSubmitSuccess();
            }).catch(err => {
                addToast(`Unexpected error: ${err.data}`, 'danger');
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
                {content ? "Edit": "Create New"} Program
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseForm">
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Program Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Artificial Intelligence"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
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
                    </Form.Group>
                    <Form.Group
                        className="mb-3 d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="flex-grow-1">
                            <Form.Label>Program Type</Form.Label>
                            <Form.Select value={selectedPTypeId}
                                onChange={e => setSelectedPTypeId(Number(e.target.value))}>
                                <option value={0}>Select Program Type</option>
                                {
                                    programTypes?.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)
                                }
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 " controlId="exampleForm.ControlInput1">
                        <Form.Label>Program Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="e.g. This program allows students to master the field of artificial intelligence."
                            style={{ height: '100px', resize: 'none' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{content ? "Edit": "Create New"} Program</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddProgramModal;