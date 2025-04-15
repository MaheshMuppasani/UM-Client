import { useState } from "react";
import ReactQuill from 'react-quill';
import { Button, Form, Modal } from "react-bootstrap";
import { toolbarOptions } from "../../assets/constants";

const announcement_title_length = 10;
const announcement_message_length = 10;

const PostAnnouncement = (props) => {
    const { handleCreateContent } = props;
    const [value, setuserInfo] = useState('');
    const [contentName, setContentName] = useState('');
    const [errors, setErrors] = useState({
        contentName: "",
        value: ""
    })


    const handleContentName = (e) => {
        let value = e.target.value;
        if(value.trim().length >= announcement_title_length && errors.contentName){
            setErrors({...errors, contentName: ""})
        } 
        setContentName(value);
    }
    const handleUserInfo = (text) => {
        let editorPlainText = getPlainText(text).trim();
        if(editorPlainText.length >= announcement_message_length && errors.value){
            setErrors({...errors, value: ""})
        }
        return setuserInfo(text);
    }
    const module = {
        toolbar: toolbarOptions
    }

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;
        let editorPlainText = getPlainText(value).trim();
        if(editorPlainText.length < announcement_message_length){
            valid = false;
            tempForm.value = `Message should be atleast ${announcement_message_length} characters`
        } else{
            tempForm.value = "";
        }
        if(contentName.trim().length < announcement_title_length){
            valid = false;
            tempForm.contentName = `Title should be atleast ${announcement_title_length} characters`
        } else{
            tempForm.contentName = "";
        }
        return [valid, tempForm];
    }

    const handleSubmit = (e) => {
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;
        return handleCreateContent(e, { value, contentName: contentName.trim() })
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
                    New Announcement
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="addCourseContentForm">
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Announcement Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Add a title to this announcement"
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
                    </Form.Group>
                    <Form.Group
                        className="mb-3"
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label>Announcement Message</Form.Label>
                        <ReactQuill
                            modules={module}
                            theme="snow"
                            value={value}
                            className={`${errors.value ? 'is-invalid' : ""}`}
                            placeholder="Add announcement message"
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
                <Button onClick={handleSubmit}>Post Announcement</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PostAnnouncement;