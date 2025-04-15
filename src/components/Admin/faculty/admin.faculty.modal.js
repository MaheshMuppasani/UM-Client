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
    const [errors, setErrors] = useState({
        fName: "",
        lName: "",
        email: "",
        phone: "",
        selectedDeptId: "",
        designation: "",
        education: "",
        password: "",
        confirmPW: ""
    });

    // Validation constants
    const MIN_NAME_LENGTH = 2;
    const MAX_NAME_LENGTH = 30;
    const MIN_EDU_LENGTH = 5;
    const MAX_EDU_LENGTH = 50;
    const MIN_PW_LENGTH = 5;
    const MAX_PW_LENGTH = 15;
    const PHONE_REGEX = /^\+\d{1,3}-\d{7,15}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;

        // Validate first name
        if(fName.trim().length < MIN_NAME_LENGTH || fName.trim().length > MAX_NAME_LENGTH) {
            valid = false;
            tempForm.fName = `First name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`;
        } else {
            tempForm.fName = "";
        }

        // Validate last name
        if(lName.trim().length < MIN_NAME_LENGTH || lName.trim().length > MAX_NAME_LENGTH) {
            valid = false;
            tempForm.lName = `Last name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`;
        } else {
            tempForm.lName = "";
        }

        // Validate email
        if(!EMAIL_REGEX.test(email)) {
            valid = false;
            tempForm.email = "Please enter a valid email address";
        } else {
            tempForm.email = "";
        }

        // Validate phone
        if(!PHONE_REGEX.test(phone)) {
            valid = false;
            tempForm.phone = "Phone must be in format +(country code)-(number)";
        } else {
            tempForm.phone = "";
        }

        // Validate department
        if(!selectedDeptId || selectedDeptId === 0) {
            valid = false;
            tempForm.selectedDeptId = "Please select a department";
        } else {
            tempForm.selectedDeptId = "";
        }

        // Validate designation
        if(!designation || designation === 0) {
            valid = false;
            tempForm.designation = "Please select a designation";
        } else {
            tempForm.designation = "";
        }

        // Validate education
        if(education.trim().length < MIN_EDU_LENGTH || education.trim().length > MAX_EDU_LENGTH) {
            valid = false;
            tempForm.education = `Education must be between ${MIN_EDU_LENGTH} and ${MAX_EDU_LENGTH} characters`;
        } else {
            tempForm.education = "";
        }

        // Validate password (only for new faculty)
        if(!content) {
            if(password.length < MIN_PW_LENGTH || password.length > MAX_PW_LENGTH) {
                valid = false;
                tempForm.password = `Password must be between ${MIN_PW_LENGTH} and ${MAX_PW_LENGTH} characters`;
            } else if(password !== confirmPW) {
                valid = false;
                tempForm.password = "Passwords do not match";
                tempForm.confirmPW = "Passwords do not match";
            } else {
                tempForm.password = "";
                tempForm.confirmPW = "";
            }
        }

        return [valid, tempForm];
    }

    const handleFNameChange = (e) => {
        const value = e.target.value;
        setFName(value);
        if(value.trim().length >= MIN_NAME_LENGTH && value.trim().length <= MAX_NAME_LENGTH && errors.fName) {
            setErrors({...errors, fName: ""});
        }
    }

    const handleLNameChange = (e) => {
        const value = e.target.value;
        setLName(value);
        if(value.trim().length >= MIN_NAME_LENGTH && value.trim().length <= MAX_NAME_LENGTH && errors.lName) {
            setErrors({...errors, lName: ""});
        }
    }

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if(EMAIL_REGEX.test(value) && errors.email) {
            setErrors({...errors, email: ""});
        }
    }

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhone(value);
        if(PHONE_REGEX.test(value) && errors.phone) {
            setErrors({...errors, phone: ""});
        }
    }

    const handleDeptChange = (e) => {
        const value = Number(e.target.value);
        setSelectedDeptId(value);
        if(value !== 0 && errors.selectedDeptId) {
            setErrors({...errors, selectedDeptId: ""});
        }
    }

    const handleDesignationChange = (e) => {
        const value = Number(e.target.value);
        setDesignation(value);
        if(value !== 0 && errors.designation) {
            setErrors({...errors, designation: ""});
        }
    }

    const handleEducationChange = (e) => {
        const value = e.target.value;
        setEducation(value);
        if(value.trim().length >= MIN_EDU_LENGTH && value.trim().length <= MAX_EDU_LENGTH && errors.education) {
            setErrors({...errors, education: ""});
        }
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        if (value.length >= MIN_PW_LENGTH && value.length <= MAX_PW_LENGTH) {
            setErrors(prev => ({
                ...prev, 
                password: "",
                confirmPW: value === confirmPW ? "" : prev.confirmPW
            }));
        }
    }

    const handleConfirmPWChange = (e) => {
        const value = e.target.value;
        setConfirmPW(value);
        
        if (value === password) {
            setErrors(prev => ({
                ...prev,
                password: "",
                confirmPW: ""
            }));
        }
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;

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
                    <Form.Group className="d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`e.g. John (${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} chars)`}
                                value={fName}
                                onChange={handleFNameChange}
                                className={`${errors.fName ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.fName ? "invalid-feedback" : ""}`}>
                                {errors.fName ? errors.fName : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className="w-50">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`e.g. Abraham (${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} chars)`}
                                value={lName}
                                onChange={handleLNameChange}
                                className={`${errors.lName ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.lName ? "invalid-feedback" : ""}`}>
                                {errors.lName ? errors.lName : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="e.g. john@example.com"
                                value={email}
                                onChange={handleEmailChange}
                                className={`${errors.email ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.email ? "invalid-feedback" : ""}`}>
                                {errors.email ? errors.email : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className="w-50">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. +1-9899999999"
                                value={phone}
                                onChange={handlePhoneChange}
                                className={`${errors.phone ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.phone ? "invalid-feedback" : ""}`}>
                                {errors.phone ? errors.phone : <span aria-hidden="true" className="invisible">.</span>}
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
                        <div className="flex-grow-1">
                            <Form.Label>Select A Designation</Form.Label>
                            <Form.Select 
                                value={designation}
                                onChange={handleDesignationChange}
                                className={`${errors.designation ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select a designation</option>
                                {Object.values(designations).map((d, i) => {
                                    return <option key={i+1} value={i+1}>{d}</option>
                                })}
                            </Form.Select>
                            <div className={`${errors.designation ? "invalid-feedback" : ""}`}>
                                {errors.designation ? errors.designation : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink gap-3" controlId="exampleForm.ControlInput1">
                        <div>
                            <Form.Label>Education</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`e.g. MSc in Biology (${MIN_EDU_LENGTH}-${MAX_EDU_LENGTH} chars)`}
                                value={education}
                                onChange={handleEducationChange}
                                className={`${errors.education ? 'is-invalid' : ""}`}
                            />
                            <div className={`${errors.education ? "invalid-feedback" : ""}`}>
                                {errors.education ? errors.education : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    {!content && (
                        <Form.Group
                            className="mb-3 d-flex gap-3"
                            controlId="exampleForm.ControlInput1"
                        >
                            <div className="w-50">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder={`${MIN_PW_LENGTH}-${MAX_PW_LENGTH} characters`}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`${errors.password ? 'is-invalid' : ""}`}
                                />
                                <div className={`${errors.password ? "invalid-feedback" : ""}`}>
                                    {errors.password ? errors.password : <span aria-hidden="true" className="invisible">.</span>}
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPW}
                                    onChange={handleConfirmPWChange}
                                    className={`${errors.confirmPW ? 'is-invalid' : ""}`}
                                />
                                <div className={`${errors.confirmPW ? "invalid-feedback" : ""}`}>
                                    {errors.confirmPW ? errors.confirmPW : <span aria-hidden="true" className="invisible">.</span>}
                                </div>
                            </div>
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{content ? "Edit": "Add New"} Faculty</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddFacultyModal;