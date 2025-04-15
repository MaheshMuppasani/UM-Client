import { useState } from "react";
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
    const [errors, setErrors] = useState({
        title: "",
        selectedDeptId: "",
        selectedPTypeId: "",
        description: ""
    });

    // Validation constants
    const MIN_TITLE_LENGTH = 5;
    const MAX_TITLE_LENGTH = 100;
    const MIN_DESC_LENGTH = 5;
    const MAX_DESC_LENGTH = 500;

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;

        // Validate program title
        if(title.trim().length < MIN_TITLE_LENGTH || title.trim().length > MAX_TITLE_LENGTH) {
            valid = false;
            tempForm.title = `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`;
        } else {
            tempForm.title = "";
        }

        // Validate department selection
        if(!selectedDeptId || selectedDeptId === 0) {
            valid = false;
            tempForm.selectedDeptId = "Please select a department";
        } else {
            tempForm.selectedDeptId = "";
        }

        // Validate program type selection
        if(!selectedPTypeId || selectedPTypeId === 0) {
            valid = false;
            tempForm.selectedPTypeId = "Please select a program type";
        } else {
            tempForm.selectedPTypeId = "";
        }

        // Validate description (optional but must meet length if provided)
        if(description && (description.trim().length < MIN_DESC_LENGTH || description.trim().length > MAX_DESC_LENGTH)) {
            valid = false;
            tempForm.description = `Description must be between ${MIN_DESC_LENGTH} and ${MAX_DESC_LENGTH} characters if provided`;
        } else {
            tempForm.description = "";
        }

        return [valid, tempForm];
    }

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        if(value.trim().length >= MIN_TITLE_LENGTH && value.trim().length <= MAX_TITLE_LENGTH && errors.title) {
            setErrors({...errors, title: ""});
        }
    }

    const handleDeptChange = (e) => {
        const value = Number(e.target.value);
        setSelectedDeptId(value);
        if(value !== 0 && errors.selectedDeptId) {
            setErrors({...errors, selectedDeptId: ""});
        }
    }

    const handlePTypeChange = (e) => {
        const value = Number(e.target.value);
        setSelectedPTypeId(value);
        if(value !== 0 && errors.selectedPTypeId) {
            setErrors({...errors, selectedPTypeId: ""});
        }
    }

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        if((!value || (value.trim().length >= MIN_DESC_LENGTH && value.trim().length <= MAX_DESC_LENGTH)) && errors.description) {
            setErrors({...errors, description: ""});
        }
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;

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
                    <Form.Group className="d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Program Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`e.g. Artificial Intelligence (${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} chars)`}
                                value={title}
                                onChange={handleTitleChange}
                                className={`${errors.title ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.title ? "invalid-feedback" : ""}`}>
                                {errors.title ? errors.title : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Department</Form.Label>
                            <Form.Select 
                                value={selectedDeptId}
                                onChange={handleDeptChange}
                                className={`${errors.selectedDeptId ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Department</option>
                                {departments?.map(d => <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name} [{d.Department_Code}]</option>)}
                            </Form.Select>
                            <div className={`${errors.selectedDeptId ? "invalid-feedback" : ""}`}>
                                {errors.selectedDeptId ? errors.selectedDeptId : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="flex-grow-1">
                            <Form.Label>Program Type</Form.Label>
                            <Form.Select 
                                value={selectedPTypeId}
                                onChange={handlePTypeChange}
                                className={`${errors.selectedPTypeId ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Program Type</option>
                                {programTypes?.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)}
                            </Form.Select>
                            <div className={`${errors.selectedPTypeId ? "invalid-feedback" : ""}`}>
                                {errors.selectedPTypeId ? errors.selectedPTypeId : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink " controlId="exampleForm.ControlInput1">
                        <Form.Label>Program Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder={`e.g. This program allows students to... (${MIN_DESC_LENGTH}-${MAX_DESC_LENGTH} chars if provided)`}
                            style={{ height: '100px', resize: 'none' }}
                            value={description}
                            onChange={handleDescriptionChange}
                            className={`${errors.description ? 'is-invalid' : ""}`}
                        />
                        <div className={`${errors.description ? "invalid-feedback" : ""}`}>
                            {errors.description ? errors.description : <span aria-hidden="true" className="invisible">.</span>}
                        </div>
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