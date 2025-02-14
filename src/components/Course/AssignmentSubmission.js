import { Button, Form } from "react-bootstrap";
import RenderContentFiles from "./courseContentfiles";
import { RenderContentBody } from "./tabs/courseContentTab";
import { excludedExtensions, toolbarOptions } from "../../assets/constants";
import axiosInstance from "../../axiosInstance";
import { useToast } from "../../AppToast";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import { formDataHeaders, URLS } from "../../assets/urlConstants";
import { useUserRole } from "../../userRole";

const AssignmentSubmission = (props) => {
    const { submissions, cancelSubmission, exam_id, SectionID } = props;
    const { isStudent } = useUserRole();

    const [value, setuserInfo] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const { addToast } = useToast();

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
            if (excludedExtensions.includes(fileExtension)) {
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                addToast("This file type is not supported!", 'danger', 3000);
                return;
            }
        }
        setFile(file)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        let url = URLS.submitAssignment;
        const data = {
            exam_id: exam_id,
            section_id: SectionID,
            file: file,
            submission_text: value && value!=='<p><br></p>' ? value : null,
        }
        axiosInstance.post(url, data, formDataHeaders)
            .then(res => {
                cancelSubmission(e)
                addToast("Assignment submitted successfully!", 'success');
            })
    }

    const module = {
        toolbar: toolbarOptions
    }

    const isAllowSubmission = isStudent() && !submissions[0]?.submitted_date;

    return ( <div>
            <Form className="addCourseContentForm d-flex flex-column">
                <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                >
                    {
                        submissions.length ? (submissions[0].file_id ? <RenderContentFiles content={{ file_id: submissions[0].file_id }} /> : <div className="fw-light">No files attached</div>) : (
                            <>
                                <Form.Label className="text-black-50">Choose or drag files here:</Form.Label>
                                <Form.Control
                                    type="file"
                                    placeholder="upload your file"
                                    id="fileInput"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="mb-3"
                                />
                            </>
                        )
                    }
                    <Form.Label className="text-black-50">Submission comments or text:</Form.Label>
                    {
                        submissions.length ? (submissions[0].submission_text ? <RenderContentBody contents={{ content_data: submissions[0].submission_text }} /> : <div className="fw-light">No comments</div>) : (
                            <ReactQuill
                                modules={module}
                                theme="snow"
                                value={value}
                                placeholder="Write assignment comments or text"
                                onChange={setuserInfo}
                            />
                        )
                    }
                </Form.Group>
                {
                    isAllowSubmission && <div className="align-self-end d-flex gap-3">
                        <Button className="btn-sm btn-secondary" onClick={cancelSubmission}>Cancel</Button>
                        <Button className="btn-sm" type="submit" onClick={handleSubmit}>Submit</Button>
                    </div>
                }
            </Form>
        </div>);
}
 
export default AssignmentSubmission;