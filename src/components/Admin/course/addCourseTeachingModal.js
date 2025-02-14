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
    const { constants } = useConstants();
    const { semesters } = constants;

    const { addToast } = useToast();

    const handleSubmit = (e) => {
        let url = content ? URLS.editTeachingSection : URLS.addNewTeachingSection;
        const data = {
            Section_ID: content ? Number(content.Section_ID) : null,
            CourseID: courseID,
            Professor_ID: facultyID,
            Section_DeliveryMode: deliveryModeID,
            capacity,
            SemesterID: selectedSemesterId,
            is_section_open: sectionOpen
        }
        // const updateMethod = content ? axiosInstance.put : axiosInstance.post;
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
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Course</Form.Label>
                            <Form.Select
                                disabled={true}
                                value={courseID}
                            // onChange={e => setSelectedDeptId(Number(e.target.value))}
                            >
                                <option value={0}>Select course</option>

                                {
                                    courses?.map(c => <option key={c.Course_ID} value={c.Course_ID}>{c.Course_Name} [CR {c.CreditHours}]</option>)
                                }
                            </Form.Select>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <div class="form-check form-switch d-flex gap-2 mt-4 align-items-center">
                                <input 
                                    class="form-check-input"
                                    style={{width: "35px", height: "20px"}} 
                                    type="checkbox" role="switch" 
                                    id="flexSwitchCheckChecked" 
                                    checked={sectionOpen}
                                    onChange={e=>setsectionOpen(e.target.checked)} 
                                />
                                <label class="form-check-label mt-1" for="flexSwitchCheckChecked">Enrollable For Students</label>
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Add Faculty</Form.Label>
                            <Form.Select
                                value={facultyID}
                                onChange={e => setfacultyID(Number(e.target.value))}
                            >
                                <option value={0}>Select Faculty</option>
                                {
                                    facultyList?.map(f => <option key={f.Faculty_ID} value={f.Faculty_ID}>{commaSeperateFullName(f.FacultyName)}</option>)
                                }
                            </Form.Select>
                        </div>
                        <div className="w-50">
                            <Form.Label>Delivery Mode</Form.Label>
                            <Form.Select
                                value={deliveryModeID}
                                onChange={e => setdeliveryModeID(Number(e.target.value))}
                            >
                                <option value={0}>Select a delivery Mode</option>
                                <option value={1}>Online Asynchronous</option>
                                <option value={2}>Online Synchronous</option>
                                <option value={3}>Face-to-Face</option>
                                <option value={4}>Hybrid</option>
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="mb-3 d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="flex-grow-1">
                            <Form.Label>Select a semester</Form.Label>
                            <Form.Select
                                value={selectedSemesterId}
                                onChange={e => setselectedSemesterId(Number(e.target.value))}
                            >
                                <option value={0}>Select semester</option>
                                {
                                    renderSemesters(semesters)
                                }
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Seating Capacity</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="e.g 30"
                                value={capacity}
                                onChange={e => setCapacity((Number(e.target.value) | 0) || "")}
                            />
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