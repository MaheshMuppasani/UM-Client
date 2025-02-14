import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import ReactQuill from "react-quill";
import { contentTypes, LinkIcon, toolbarOptions } from "../../assets/constants";

const AddCourseContentModal = (props) => {
    const { handleCreateContent, content } = props;
    const editContent = content;
    const [value, setuserInfo] = useState(editContent && content.content_data || '');
    const [contentName, setContentName] = useState(editContent && content.content_name || '');
    const [contentType, setContentType] = useState((editContent && contentTypes.findIndex(ct => ct === content.content_type) + 1 || 1));
    const [contentTitleURL, setContentTitleURL] = useState(editContent && content.content_title_link || "");
    const [file, setFile] = useState(null);

    const handleContentName = (e) => {
        setContentName(e.target.value);
    }

    const handleContentTitleURL = (e) => setContentTitleURL(e.target.value);
    const module = {
        toolbar: toolbarOptions
    }

    const handleSubmit = (e) => {
        return handleCreateContent(e, { value, contentName, contentType, editContent, contentTitleURL, file })
    }

    const handleContentTypeSelection = (e) => {
        setContentType(e.target.value);
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Capture the first selected file
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
                    {modalTitle} Course Content
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseContentForm">
                    <Form.Group className="mb-3 d-flex gap-5" controlId="exampleForm.ControlInput1">
                        <div className="w-25">
                            <Form.Label>Select content type</Form.Label>
                            <Form.Select value={contentType} onChange={handleContentTypeSelection}>
                                <option value={1}>Text</option>
                                <option value={2}>Folder</option>
                                <option value={3}>Text with title URL</option>
                                <option value={4}>File</option>
                            </Form.Select>
                        </div>
                    </Form.Group>
                    <Form.Group className="TextwithLink mb-3 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Content Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add a title to this content"
                                value={contentName}
                                onChange={handleContentName}
                                autoFocus
                            />
                            {
                                contentType == 4 && (
                                    <Form.Control
                                        type="file"
                                        placeholder="upload your file"
                                        id="fileInput"
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                )
                            }
                        </div>
                        {
                            contentType == 3 && (
                                <>
                                    <div className="d-flex align-items-center"><LinkIcon className={"mt-4"} /></div>
                                    <div className="w-25 flex-grow-1">
                                        <Form.Label>Title URL</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Add an url to your title"
                                            value={contentTitleURL}
                                            onChange={handleContentTitleURL}
                                        />
                                    </div>
                                </>
                            )
                        }
                    </Form.Group>
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label>Course Content</Form.Label>
                        <ReactQuill
                            modules={module}
                            theme="snow"
                            value={value}
                            placeholder="Add course content information"
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

export default AddCourseContentModal;