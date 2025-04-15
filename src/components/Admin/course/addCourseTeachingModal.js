import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import axiosInstance from "../../../axiosInstance";
import { URLS } from "../../../assets/urlConstants";
import { commaSeperateFullName } from "../../Student/studentEnrollment";
import { renderSemesters } from "../../Student/studentRegistration";
import { useToast } from "../../../AppToast";

export const getDeliveryMode = (deliveryMode) => {
    switch(deliveryMode){
        case "Online Asynchronous": return 1;
        case "Online Synchronous": return 2;
        case "Hybrid": return 3;
        default: return 0
    }
}

const AddCourseTeachingModal = (props) => {
    const { content, courseID, courses, programId, onHide, onSubmitSuccess } = props;

    const [facultyList, setFacultyList] = useState([]);
    const [facultyID, setfacultyID] = useState(content ? content.Faculty_ID : null);
    const [deliveryModeID, setdeliveryModeID] = useState(content ? getDeliveryMode(content.Section_DeliveryMode) : null);
    const [selectedSemesterId, setselectedSemesterId] = useState(content ? content.SemesterID : null);
    const [capacity, setCapacity] = useState(content ? content.Capacity : "");
    const [sectionOpen, setsectionOpen] = useState(content ? content.is_section_open : true);
    const [errors, setErrors] = useState({
        facultyID: "",
        deliveryModeID: "",
        selectedSemesterId: "",
        capacity: ""
    });
    const { constants } = useConstants();
    const { semesters } = constants;
    const { addToast } = useToast();

    // Constants for validation
    const min_capacity = 5;
    const max_capacity = 100;

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;

        // Validate faculty selection
        if(!facultyID || facultyID === 0){
            valid = false;
            tempForm.facultyID = "Please select a faculty member";
        } else {
            tempForm.facultyID = "";
        }

        // Validate delivery mode
        if(!deliveryModeID || deliveryModeID === 0){
            valid = false;
            tempForm.deliveryModeID = "Please select a delivery mode";
        } else {
            tempForm.deliveryModeID = "";
        }

        // Validate semester
        if(!selectedSemesterId || selectedSemesterId === 0){
            valid = false;
            tempForm.selectedSemesterId = "Please select a semester";
        } else {
            tempForm.selectedSemesterId = "";
        }

        // Validate capacity
        const capacityNum = Number(capacity);
        if(isNaN(capacityNum) || capacityNum < min_capacity || capacityNum > max_capacity){
            valid = false;
            tempForm.capacity = `Capacity must be between ${min_capacity} and ${max_capacity}`;
        } else {
            tempForm.capacity = "";
        }

        return [valid, tempForm];
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;

        let url = content ? URLS.editTeachingSection : URLS.addNewTeachingSection;
        const data = {
            Section_ID: content ? Number(content.Section_ID) : null,
            CourseID: courseID,
            Professor_ID: facultyID,
            Section_DeliveryMode: deliveryModeID,
            capacity: Number(capacity),
            SemesterID: selectedSemesterId,
            is_section_open: sectionOpen
        }

        if(content){
            axiosInstance.put(url, data).then(res => {
                addToast(`Section ${content ? 'updated' : 'added'} successfully!`, 'success');
                onHide()
                onSubmitSuccess();
            })
        }
        else{
            axiosInstance.post(url, data).then(res => {
                addToast(`Section ${content ? 'updated' : 'added'} successfully!`, 'success');
                onHide()
                onSubmitSuccess();
            })
        }
    }

    const handleFacultyChange = (e) => {
        const value = Number(e.target.value);
        setfacultyID(value);
        if(value !== 0 && errors.facultyID){
            setErrors({...errors, facultyID: ""});
        }
    }

    const handleDeliveryModeChange = (e) => {
        const value = Number(e.target.value);
        setdeliveryModeID(value);
        if(value !== 0 && errors.deliveryModeID){
            setErrors({...errors, deliveryModeID: ""});
        }
    }

    const handleSemesterChange = (e) => {
        const value = Number(e.target.value);
        setselectedSemesterId(value);
        if(value !== 0 && errors.selectedSemesterId){
            setErrors({...errors, selectedSemesterId: ""});
        }
    }

    const handleCapacityChange = (e) => {
        const value = e.target.value;
        const numValue = Number(value);
        setCapacity(value);
        if(!isNaN(numValue) && numValue >= min_capacity && numValue <= max_capacity && errors.capacity){
            setErrors({...errors, capacity: ""});
        }
    }

    useEffect(() => {
        if (!programId) return;
        let url = `${URLS.getFacultiesByProgramID}/${programId}`
        axiosInstance.get(url).then(res => {
            setFacultyList(res.data);
        })
    }, [programId])

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
                    {content ? "Edit" : "Create New"} Teaching Section
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseForm">
                    <Form.Group className="mb-2 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Course</Form.Label>
                            <Form.Select
                                disabled={true}
                                value={courseID}
                            >
                                <option value={0}>Select course</option>
                                {courses?.map(c => <option key={c.Course_ID} value={c.Course_ID}>{c.Course_Name} [CR {c.CreditHours}]</option>)}
                            </Form.Select>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <div className="form-check form-switch d-flex gap-2 mt-4 align-items-center">
                                <input 
                                    className="form-check-input"
                                    style={{width: "35px", height: "20px"}} 
                                    type="checkbox" role="switch" 
                                    id="flexSwitchCheckChecked" 
                                    checked={sectionOpen}
                                    onChange={e=>setsectionOpen(e.target.checked)} 
                                />
                                <label className="form-check-label mt-1" htmlFor="flexSwitchCheckChecked">Enrollable For Students</label>
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Add Faculty</Form.Label>
                            <Form.Select
                                value={facultyID}
                                onChange={handleFacultyChange}
                                className={`${errors.facultyID ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Faculty</option>
                                {facultyList?.map(f => <option key={f.Faculty_ID} value={f.Faculty_ID}>{commaSeperateFullName(f.FacultyName)}</option>)}
                            </Form.Select>
                            <div className={`${errors.facultyID ? "invalid-feedback" : ""}`}>
                                {errors.facultyID ? errors.facultyID : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className="w-50">
                            <Form.Label>Delivery Mode</Form.Label>
                            <Form.Select
                                value={deliveryModeID}
                                onChange={handleDeliveryModeChange}
                                className={`${errors.deliveryModeID ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select a delivery Mode</option>
                                <option value={1}>Online Asynchronous</option>
                                <option value={2}>Online Synchronous</option>
                                <option value={3}>Face-to-Face</option>
                                <option value={4}>Hybrid</option>
                            </Form.Select>
                            <div className={`${errors.deliveryModeID ? "invalid-feedback" : ""}`}>
                                {errors.deliveryModeID ? errors.deliveryModeID : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="flex-grow-1">
                            <Form.Label>Select a semester</Form.Label>
                            <Form.Select
                                value={selectedSemesterId}
                                onChange={handleSemesterChange}
                                className={`${errors.selectedSemesterId ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select semester</option>
                                {renderSemesters(semesters)}
                            </Form.Select>
                            <div className={`${errors.selectedSemesterId ? "invalid-feedback" : ""}`}>
                                {errors.selectedSemesterId ? errors.selectedSemesterId : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Seating Capacity</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder={`e.g 30 (${min_capacity}-${max_capacity})`}
                                value={capacity}
                                onChange={handleCapacityChange}
                                className={`${errors.capacity ? 'is-invalid' : ""}`}
                                min={min_capacity}
                                max={max_capacity}
                            />
                            <div className={`${errors.capacity ? "invalid-feedback" : ""}`}>
                                {errors.capacity ? errors.capacity : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{content ? "Edit" : "Add"} Teaching Section</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddCourseTeachingModal;