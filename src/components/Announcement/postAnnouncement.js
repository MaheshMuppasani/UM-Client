import { useState } from "react";
import ReactQuill from 'react-quill';
import { Button, Form, Modal } from "react-bootstrap";
import { toolbarOptions } from "../../assets/constants";

const PostAnnouncement = (props) => {
    const { handleCreateContent } = props;
    const [value, setuserInfo] = useState('');
    const [contentName, setContentName] = useState('');


    const handleContentName = (e) => {
        setContentName(e.target.value);
    }
    const module = {
        toolbar: toolbarOptions
    }

    const handleSubmit = (e) => {
        return handleCreateContent(e, { value, contentName })
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
                            onChange={handleContentName}
                            autoFocus
                        />
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
                            placeholder="Add announcement message"
                            onChange={setuserInfo} />
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