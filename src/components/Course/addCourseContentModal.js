import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import ReactQuill from "react-quill";
import { contentTypes, LinkIcon, toolbarOptions } from "../../assets/constants";

const content_title_length = 10;
const content_message_length = 10;

const AddCourseContentModal = (props) => {
    const { handleCreateContent, content } = props;
    const editContent = content;
    const [value, setuserInfo] = useState(editContent && content.content_data || '');
    const [contentName, setContentName] = useState(editContent && content.content_name || '');
    const [contentType, setContentType] = useState((editContent && contentTypes.findIndex(ct => ct === content.content_type) + 1 || 1));
    const [contentTitleURL, setContentTitleURL] = useState(editContent && content.content_title_link || "");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({
        contentName: "",
        value: "",
        contentTitleURL: ""
    });

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const handleContentName = (e) => {
        let value = e.target.value;
        if(value.trim().length >= content_title_length && errors.contentName){
            setErrors({...errors, contentName: ""});
        }
        setContentName(value);
    }

    const handleContentTitleURL = (e) => {
        let value = e.target.value;
        if(value.trim().length > 0 && errors.contentTitleURL){
            setErrors({...errors, contentTitleURL: ""});
        }
        setContentTitleURL(value);
    }

    const handleUserInfo = (text) => {
        let editorPlainText = getPlainText(text).trim();
        if(editorPlainText.length >= content_message_length && errors.value){
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

        // Validate content title
        if(contentName.trim().length < content_title_length){
            valid = false;
            tempForm.contentName = `Title should be atleast ${content_title_length} characters`;
        } else {
            tempForm.contentName = "";
        }

        // Validate content message
        if(editorPlainText.length < content_message_length){
            valid = false;
            tempForm.value = `Content should be atleast ${content_message_length} characters`;
        } else {
            tempForm.value = "";
        }

        // Validate title URL if content type is 3 (Text with title URL)
        if(contentType == 3 && !contentTitleURL.trim()){
            valid = false;
            tempForm.contentTitleURL = "Title URL is required";
        } else if(contentType != 3) {
            tempForm.contentTitleURL = "";
        }

        return [valid, tempForm];
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;
        return handleCreateContent(e, { value, contentName: contentName.trim(), contentType, editContent, contentTitleURL, file });
    }

    const handleContentTypeSelection = (e) => {
        setContentType(e.target.value);
        // Clear URL validation when content type changes
        if(e.target.value != 3 && errors.contentTitleURL){
            setErrors({...errors, contentTitleURL: ""});
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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
                    <Form.Group className="TextwithLink mb-1 d-flex gap-3" controlId="exampleForm.ControlInput1">
                        <div className="flex-grow-1">
                            <Form.Label>Content Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add a title to this content"
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
                                    <div className="d-flex align-items-center"><LinkIcon /></div>
                                    <div className="w-25 flex-grow-1">
                                        <Form.Label>Title URL</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Add an url to your title"
                                            value={contentTitleURL}
                                            className={`form-control ${errors.contentTitleURL ? 'is-invalid' : ""}`}
                                            onChange={handleContentTitleURL}
                                        />
                                        <div className={`${errors.contentTitleURL ? "invalid-feedback" : ""}`}>
                                            {
                                                errors.contentTitleURL
                                                    ? errors.contentTitleURL
                                                    : <span aria-hidden="true" className="invisible">.</span>
                                            }
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    </Form.Group>
                    <Form.Group
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label>Course Content</Form.Label>
                        <ReactQuill
                            modules={module}
                            theme="snow"
                            value={value}
                            className={`${errors.value ? 'is-invalid' : ""}`}
                            placeholder="Add course content information"
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

export default AddCourseContentModal;