import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import ReactQuill from "react-quill";
import { contentTypes, excludedExtensions, LinkIcon, toolbarOptions } from "../../assets/constants";
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

    const { addToast } = useToast();

    const handleContentName = (e) => {
        setContentName(e.target.value);
    }

    const module = {
        toolbar: toolbarOptions
    }

    const handleSubmit = (e) => {
        return handleCreateContent(e, { value, contentName, editContent, file, dueDate: `${dueDate}T${dueTime}`, maxScore })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
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
        setFile(file)
    };
    const modalTitle = editContent ? "Edit" : "Add"
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
                    <Form.Group className="TextwithLink mb-3 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Assignment Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add a title to this assignment"
                                value={contentName}
                                onChange={handleContentName}
                                autoFocus
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="w-25">
                            <Form.Label>Due Date and Time:</Form.Label>
                            <Form.Control
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={fetchDueDateTime(new Date()).formattedDate()}
                                autoFocus
                            />
                        </div>
                        <div className="w-25">
                            <Form.Label aria-hidden="true" className="invisible">Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={dueTime}
                                onChange={e => setDueTime(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="w-25">
                            <Form.Label >Maximum Score</Form.Label>
                            <Form.Control
                                type="number"
                                value={maxScore}
                                onChange={e => setMaxScore(Number(e.target.value))}
                                autoFocus
                            />
                        </div>
                    </Form.Group>
                    <Form.Group
                        className="mb-3"
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
                            placeholder="Write assignment instructions"
                            onChange={setuserInfo} />
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