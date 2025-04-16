import { useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import ReactQuill from "react-quill";
import { excludedExtensions, toolbarOptions } from "../../assets/constants";
import { useToast } from "../../AppToast";
import { fetchDueDateTime } from "../../utils/utils";

const NewAssignmentModal = (props) => {
    const { handleCreateContent, content } = props;
    const editContent = content;

    const [value, setuserInfo] = useState(editContent && content.Instructions_data || '');
    const [contentName, setContentName] = useState(editContent && content.Title || '');
    const [dueDate, setDueDate] = useState(editContent ? fetchDueDateTime(editContent.ExamDueDate).formattedDate() : null);
    const [dueTime, setDueTime] = useState(editContent ? fetchDueDateTime(editContent.ExamDueDate).formattedTime() : "23:59:59");
    const [maxScore, setMaxScore] = useState(editContent?.MaximumScore || undefined);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({
        contentName: "",
        dueDate: "",
        dueTime: "",
        maxScore: "",
        value: ""
    });

    const { addToast } = useToast();

    // Constants for validation
    const title_min_length = 10;
    const instructions_min_length = 10;
    const max_score_value = 100;

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const handleContentName = (e) => {
        let value = e.target.value;
        if(value.trim().length >= title_min_length && errors.contentName){
            setErrors({...errors, contentName: ""});
        }
        setContentName(value);
    }

    const handleDueDateChange = (e) => {
        setDueDate(e.target.value);
        if(e.target.value && errors.dueDate){
            setErrors({...errors, dueDate: ""});
        }
    }

    const handleDueTimeChange = (e) => {
        setDueTime(e.target.value);
        if(e.target.value && errors.dueTime){
            setErrors({...errors, dueTime: ""});
        }
    }

    const handleMaxScoreChange = (e) => {
        const score = Number(e.target.value);
        setMaxScore(score);
        if(!isNaN(score) && score >= 0 && score <= max_score_value && errors.maxScore){
            setErrors({...errors, maxScore: ""});
        }
    }

    const handleUserInfo = (text) => {
        let editorPlainText = getPlainText(text).trim();
        if(editorPlainText.length >= instructions_min_length && errors.value){
            setErrors({...errors, value: ""});
        }
        return setuserInfo(text);
    }

    const module = {
        toolbar: toolbarOptions
    }

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;
        let editorPlainText = getPlainText(value).trim();

        // Validate assignment title
        if(contentName.trim().length < title_min_length){
            valid = false;
            tempForm.contentName = `Title should be at least ${title_min_length} characters`;
        } else {
            tempForm.contentName = "";
        }

        // Validate due date
        if(!dueDate){
            valid = false;
            tempForm.dueDate = "Due date is required";
        } else {
            tempForm.dueDate = "";
        }

        // Validate due time
        if(!dueTime){
            valid = false;
            tempForm.dueTime = "Due time is required";
        } else {
            tempForm.dueTime = "";
        }

        // Validate max score
        if(isNaN(maxScore) || maxScore === undefined || maxScore < 0 || maxScore > max_score_value){
            valid = false;
            tempForm.maxScore = `Score must be between 0 and ${max_score_value}`;
        } else {
            tempForm.maxScore = "";
        }

        // Validate instructions (rich text)
        if(editorPlainText.length < instructions_min_length){
            valid = false;
            tempForm.value = `Instructions should be at least ${instructions_min_length} characters`;
        } else {
            tempForm.value = "";
        }

        return [valid, tempForm];
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;
        return handleCreateContent(e, { value, contentName, editContent, file, dueDate: new Date(`${dueDate}T${dueTime}`).toISOString(), maxScore });
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file){
            const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
            if(excludedExtensions.includes(fileExtension)){
                setFile(null);
                if(fileInputRef.current){
                    fileInputRef.current.value = "";
                }
                addToast("This file type is not supported!", 'danger', 3000);
                return;
            }
        }
        setFile(file);
    };

    const modalTitle = editContent ? "Edit" : "Add";
    
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
                    {modalTitle} Course Assignment
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseContentForm">
                    <Form.Group className="TextwithLink d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Assignment Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add a title to this assignment"
                                value={contentName}
                                className={`form-control ${errors.contentName ? 'is-invalid' : ""}`}
                                onChange={handleContentName}
                                autoFocus
                            />
                            <div className={`${errors.contentName ? "invalid-feedback" : ""}`}>
                                {
                                    errors.contentName
                                        ? errors.contentName
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="w-25">
                            <Form.Label>Due Date and Time:</Form.Label>
                            <Form.Control
                                type="date"
                                value={dueDate}
                                className={`form-control ${errors.dueDate ? 'is-invalid' : ""}`}
                                onChange={handleDueDateChange}
                                min={fetchDueDateTime(new Date()).formattedDate()}
                            />
                            <div className={`${errors.dueDate ? "invalid-feedback" : ""}`}>
                                {
                                    errors.dueDate
                                        ? errors.dueDate
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="w-25">
                            <Form.Label aria-hidden="true" className="invisible">Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={dueTime}
                                className={`form-control ${errors.dueTime ? 'is-invalid' : ""}`}
                                onChange={handleDueTimeChange}
                            />
                            <div className={`${errors.dueTime ? "invalid-feedback" : ""}`}>
                                {
                                    errors.dueTime
                                        ? errors.dueTime
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <Form.Label>Maximum Score</Form.Label>
                            <Form.Control
                                type="number"
                                value={maxScore}
                                className={`form-control ${errors.maxScore ? 'is-invalid' : ""}`}
                                onChange={handleMaxScoreChange}
                                min={0}
                                max={max_score_value}
                            />
                            <div className={`${errors.maxScore ? "invalid-feedback" : ""}`}>
                                {
                                    errors.maxScore
                                        ? errors.maxScore
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </Form.Group>
                    <Form.Group
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label>Assignment Instructions</Form.Label>
                        <Form.Control
                            type="file"
                            placeholder="upload your file"
                            id="fileInput"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="mb-3"
                        />
                        <ReactQuill
                            modules={module}
                            theme="snow"
                            value={value}
                            className={`${errors.value ? 'is-invalid' : ""}`}
                            placeholder="Write assignment instructions"
                            onChange={handleUserInfo} 
                        />
                        <div className={`${errors.value ? "invalid-feedback" : ""}`}>
                            {
                                errors.value
                                    ? errors.value
                                    : <span aria-hidden="true" className="invisible">.</span>
                            }
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit}>{modalTitle} Content</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NewAssignmentModal;