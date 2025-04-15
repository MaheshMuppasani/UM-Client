import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useConstants } from "../../../constantsProvider";
import { renderPrograms } from "../../Student/studentRegistration";
import { URLS } from "../../../assets/urlConstants";
import axiosInstance from "../../../axiosInstance";
import { useToast } from "../../../AppToast";
import CustomDropDown from "./customCourseDropDown";

export const MultiSelectedOptions = (props) => {
    const { className = "d-flex gap-1 px-3 py-2", selectedOptions, textKey, removeOption, retainHeight = true } = props;
    return (
        (selectedOptions.length || retainHeight) && (
            <div className={className}>
            {
                selectedOptions.length ? selectedOptions.map((option) => {
                    return (
                        <span key={option[textKey]} className="d-flex px-2 align-items-center badge rounded-pill custom-chip">
                            <span className="chip-text">{option[textKey]}</span>
                            <button type="button" className="btn-close p-0" aria-label="Close" onClick={e => removeOption(e, option)}></button>
                        </span>
                    )
                }) : (
                    retainHeight && <span className="d-flex px-2 align-items-center badge rounded-pill custom-chip invisible" aria-hidden="true">
                        <span className="chip-text">.</span>
                        <button type="button" className="btn-close p-0" aria-label="Close"></button>
                    </span>
                )
            }
        </div>
        ) 
    )
}

function compareArrays(arr1, arr2) {
    // If lengths are different, arrays are not equal
    if (arr1.length !== arr2.length) return false;

    // Sort and compare
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

const AddCourseModal = (props) => {
    const { defaultCourseProps, onSubmitSuccess, content } = props;
    const { constants } = useConstants();
    const { addToast } = useToast();

    const { departments, programs, programTypes } = constants;

    const [formState, setFormState] = useState({
        selectedDeptId: content ? (content.Department_ID) : (defaultCourseProps?.selectedDeptId || 0),
        selectedPTypeId: content ? (content.ProgramTypeID) : (defaultCourseProps?.selectedPTypeId || 0),
        selectedProgId: content ? (content.Course_ProgramID) : (defaultCourseProps?.selectedProgId || 0),
        courseCredits: content ? (content.CreditHours) : "",
        title: content ? (content.Course_Name) : "",
        preReqChoiceList: [],
        description: content ? (content.Course_Description) : "",
        selectedPreReqs: [],
        programRequired: content ? content.Program_required : false,
        prevPreReqs: [],
    });

    const [selectedDeptId, setSelectedDeptId] = [formState.selectedDeptId, (value) => { setFormState(ps => ({ ...ps, selectedDeptId: value })) }];
    const [selectedPTypeId, setSelectedPTypeId] = [formState.selectedPTypeId, (value) => { setFormState(ps => ({ ...ps, selectedPTypeId: value })) }];
    const [selectedProgId, setSelectedProgId] = [formState.selectedProgId, (value) => { setFormState(ps => ({ ...ps, selectedProgId: value })) }];
    const [courseCredits, setCourseCredits] = [formState.courseCredits, (value) => { setFormState(ps => ({ ...ps, courseCredits: value })) }];
    const [title, setTitle] = [formState.title, (value) => { setFormState(ps => ({ ...ps, title: value })) }];
    const [preReqChoiceList, setPreReqChoiceList] = [formState.preReqChoiceList, (value) => { setFormState(ps => ({ ...ps, preReqChoiceList: value })) }]
    const [description, setDescription] = [formState.description, (value) => { setFormState(ps => ({ ...ps, description: value })) }];
    const [selectedPreReqs, setSelectedPreReqs] = [formState.selectedPreReqs, (value) => { setFormState(ps => ({ ...ps, selectedPreReqs: value })) }]
    const [programRequired, setProgramRequired] = [formState.programRequired, (value) => { setFormState(ps => ({ ...ps, programRequired: value })) }];
    const [prevPreReqs, setPrevPreReqs] = [formState.prevPreReqs, (value) => { setFormState(ps => ({ ...ps, prevPreReqs: value })) }]

    const validateForm = (formState) => {
        let validationError = false;

        const { selectedDeptId, selectedPTypeId, selectedProgId, courseCredits, title, description, selectedPreReqs } = { ...formState };

        if (!title) {
            validationError = true;
            formState.titleError = "Course title is required"
        } else {
            if (title.length < 5 || title.length > 100) {
                validationError = true;
                formState.titleError = "Title should be 5 to 100 characters"
            } else {
                formState.titleError = ""
            }
        }

        if (!courseCredits) {
            validationError = true;
            formState.creditsError = "Please enter valid credits for this course (1 to 10)."
        } else {
            if (courseCredits < 1 || courseCredits > 10) {
                validationError = true;
                formState.creditsError = "Credits should be 1 to 10"
            } else {
                formState.creditsError = ""
            }
        }

        if (!selectedDeptId) {
            validationError = true;
            formState.dptError = "Please select a department"
        } else {
            formState.dptError = ""
        }

        if (!selectedPTypeId) {
            validationError = true;
            formState.pTypeError = "Please select a program type"
        } else {
            formState.pTypeError = ""
        }

        if (!selectedProgId) {
            validationError = true;
            formState.progError = "Please select a program"
        } else {
            formState.progError = ""
        }

        if (selectedPreReqs && selectedPreReqs.length > 5) {
            validationError = true;
            formState.preReqError = "Should be a maximum of 5 pre-requisites"
        } else {
            formState.preReqError = ""
        }

        if (description && (description.length < 10 || description.length > 500)) {
            validationError = true;
            formState.descError = "Should be 10 to 500 characters"
        } else {
            formState.descError = ""
        }


        return [formState, validationError];
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const [validatedForm, validationError] = validateForm({ ...formState });
        if (validationError) {
            setFormState(validatedForm);
            return;
        }
        let url = content ? URLS.editCourse : URLS.addNewCourse;
        const data = {
            Course_ID: content ? content.Course_ID : null,
            Course_Name: title,
            Course_Description: description || null,
            Course_ProgramID: selectedProgId,
            CreditHours: courseCredits,
            Program_required: programRequired || null,
        }
        try {
            if (content) {
                const res = await axiosInstance.put(url, data);
                if (prevPreReqs.length !== selectedPreReqs.length || compareArrays(prevPreReqs.map(p => p.Course_ID), selectedPreReqs.map(p => p.Course_ID))) {
                    url = URLS.updateCoursePreRequisites
                    await axiosInstance.post(url, {
                        CourseId: content.Course_ID,
                        PreRequisiteCourseIDs: selectedPreReqs.map(p => p.Course_ID)
                    })
                }
            } else {
                const res = await axiosInstance.post(url, data)
                const { CourseId } = res.data;
                if (CourseId && selectedPreReqs) {
                    url = URLS.addCoursePreRequisites;
                    const data = {
                        CourseId,
                        PreRequisiteCourseIDs: selectedPreReqs.map(p => p.Course_ID)
                    }
                    await axiosInstance.post(url, data)
                }
            }
            addToast(`Course ${title} ${content ? 'updated' : 'added'} successfully!`, 'success');
            props.onHide();
            onSubmitSuccess();
        }
        catch (err) {
            addToast(`Unexpected error: ${err.data}`, 'danger');
        }
    }

    const handleRemovePreReq = (e, deletePreReq) => {
        // e.stopPropagation();
        let temp = [...selectedPreReqs];
        temp = temp.filter(v => v.Course_ID !== deletePreReq.Course_ID)
        setSelectedPreReqs(temp);
    }

    const updatePreRequisite = (e, course) => {
        if(!course || !course.Course_ID) return;
        let courseId = course?.Course_ID
        if (!courseId) return;
        courseId = Number(courseId);

        let temp = [...selectedPreReqs];
        if (temp.find(sc => sc.Course_ID === courseId)) {
            temp = temp.filter(v => v.Course_ID !== courseId)
        } else {
            const selectedCourse = preReqChoiceList.find(p => p.Course_ID === courseId);
            if (selectedCourse && selectedCourse.Course_ID) {
                temp.push({
                    Course_ID: selectedCourse.Course_ID,
                    Course_Name: selectedCourse.Course_Name,
                    course_code: selectedCourse.course_code
                });
            }
        }
        setSelectedPreReqs(temp)
    }

    useEffect(() => {
        if (selectedDeptId && selectedProgId && selectedDeptId !== programs?.find(p => p.ProgramID === selectedProgId).DepartmentID) {
            setSelectedProgId(null);
        }
    }, [selectedDeptId])

    useEffect(() => {
        if (!selectedDeptId && selectedProgId) {
            const program = programs.find(p => p.ProgramID === selectedProgId);
            setSelectedDeptId(departments.find(d => d.Department_ID === program.DepartmentID).Department_ID)
        }
    }, [selectedProgId])

    useEffect(() => {
        if (selectedPTypeId && selectedProgId && selectedPTypeId !== programs?.find(p => p.ProgramID === selectedProgId).ProgramTypeID) {
            setSelectedProgId(null);
        }
    }, [selectedPTypeId])

    useEffect(() => {
        let url = URLS.getAllCourses;
        let params = {};
        axiosInstance.get(url, { params }).then((res) => {
            setPreReqChoiceList(res.data)
        })
        if (content) {
            url = URLS.getAllCoursePreRequisites
            params = {
                CourseId: content.Course_ID
            }
            axiosInstance.get(url, { params }).then((res) => {
                setSelectedPreReqs(res.data);
                setPrevPreReqs(res.data)
            })
        }
    }, [])

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
                    {content ? "Edit" : "Create New"} Course
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ overflow: 'auto' }}>
                <Form className="addCourseForm" onSubmit={e => e.preventDefault()}>
                    <Form.Group className="d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-50">
                            <Form.Label>Course Title <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Artificial Intelligence"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={`form-control ${formState.titleError ? 'is-invalid' : ""}`}
                            />
                            <div className={`${formState.titleError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.titleError
                                        ? formState.titleError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <div className="form-check form-switch d-flex gap-2 align-items-center">
                                <input
                                    className="form-check-input"
                                    style={{ width: "35px", height: "20px" }}
                                    type="checkbox" role="switch"
                                    id="flexSwitchCheckChecked"
                                    checked={programRequired}
                                    onChange={e => setProgramRequired(e.target.checked)}
                                />
                                <label className="form-check-label mt-1" for="flexSwitchCheckChecked">Program Required</label>
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Credits</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="e.g 3"
                                value={courseCredits}
                                onChange={e => setCourseCredits((Number(e.target.value) | 0) || "")}
                                className={`form-control ${formState.creditsError ? 'is-invalid' : ""}`}
                            />
                            <div className={`${formState.creditsError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.creditsError
                                        ? formState.creditsError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="w-50">
                            <Form.Label>Department</Form.Label>
                            <Form.Select value={selectedDeptId}
                                onChange={e => setSelectedDeptId(Number(e.target.value))}
                                className={`form-control ${formState.dptError ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Department</option>
                                {
                                    departments?.map(d => <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name} [{d.Department_Code}]</option>)
                                }
                            </Form.Select>
                            <div className={`${formState.dptError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.dptError
                                        ? formState.dptError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="mb-3 d-flex gap-3"
                        controlId="exampleForm.ControlInput1"
                    >
                        <div className="flex-grow-1">
                            <Form.Label>Program Type</Form.Label>
                            <Form.Select value={selectedPTypeId}
                                onChange={e => setSelectedPTypeId(Number(e.target.value))}
                                className={`form-control ${formState.pTypeError ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Program Type</option>
                                {
                                    programTypes?.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)
                                }
                            </Form.Select>
                            <div className={`${formState.pTypeError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.pTypeError
                                        ? formState.pTypeError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="w-50">
                            <Form.Label>Select Program</Form.Label>
                            <Form.Select value={selectedProgId}
                                onChange={e => setSelectedProgId(Number(e.target.value))}
                                className={`form-control ${formState.progError ? 'is-invalid' : ""}`}
                            >
                                <option value={0}>Select Program</option>
                                {
                                    renderPrograms(programs?.filter(p => !selectedDeptId ? p : selectedDeptId === p.DepartmentID), selectedPTypeId, departments)
                                }
                            </Form.Select>
                            <div className={`${formState.progError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.progError
                                        ? formState.progError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="d-flex gap-3 align-items-baseline"
                        controlId="exampleForm.ControlInput1">
                        <div>
                            <CustomDropDown
                                className={`form-control coursesearchDropDown`}
                                displayTitle={"Add Pre-Requistes"}
                                options={preReqChoiceList}
                                selectedOptions={selectedPreReqs}
                                onSelect={updatePreRequisite}
                                autoClose="outside"
                                maxSelect={5}
                            />
                            
                        </div>
                        <div className={`d-flex flex-grow-1 flex-column`}>
                            <MultiSelectedOptions 
                                className={`form-control d-flex align-items-baseline gap-1 flex-grow-1 flex-wrap rounded p-2 border ${formState.preReqError ? 'is-invalid border-danger' : ''}`}
                                selectedOptions={selectedPreReqs}
                                removeOption={handleRemovePreReq}
                                textKey={'course_code'}
                            />
                            <div className={`${formState.preReqError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.preReqError
                                        ? formState.preReqError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink" controlId="exampleForm.ControlInput1">
                        <Form.Label>Course Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="e.g. This course introduces students to the field of artificial intelligence."
                            style={{ height: '100px', resize: 'none' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className={`form-control ${formState.descError ? 'is-invalid' : ""}`}
                        />
                        <div className={`${formState.descError ? "invalid-feedback" : ""}`}>
                            {
                                formState.descError
                                    ? formState.descError
                                    : <span aria-hidden="true" className="invisible">.</span>
                            }
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{content ? "Update" : "Add"} Course</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddCourseModal;