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
    const [errors, setErrors] = useState({
        value: ""
    });
    const fileInputRef = useRef(null);
    const { addToast } = useToast();

    const comments_min_length = 10;

    const getPlainText = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
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
        setFile(file);
    };

    const handleUserInfo = (text) => {
        let editorPlainText = getPlainText(text).trim();
        if(editorPlainText.length >= comments_min_length && errors.value){
            setErrors({...errors, value: ""});
        }
        return setuserInfo(text);
    }

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;
        let editorPlainText = getPlainText(value).trim();

        // Validate comments (rich text)
        if(editorPlainText.length < comments_min_length){
            valid = false;
            tempForm.value = `Comments should be at least ${comments_min_length} characters`;
        } else {
            tempForm.value = "";
        }

        return [valid, tempForm];
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;

        let url = URLS.submitAssignment;
        const data = {
            exam_id: exam_id,
            section_id: SectionID,
            file: file,
            submission_text: value && value!=='<p><br></p>' ? value : null,
            submitted_date: new Date().toISOString()
        }
        axiosInstance.post(url, data, formDataHeaders)
            .then(res => {
                cancelSubmission(e); // close the submission window
                addToast("Assignment submitted successfully!", 'success');
            })
    }

    const module = {
        toolbar: toolbarOptions
    }

    const isAllowSubmission = isStudent() && !submissions[0]?.submitted_date;

    return (
        <div>
            <Form className="addCourseContentForm d-flex flex-column">
                <Form.Group
                    controlId="exampleForm.ControlTextarea1"
                >
                    {
                        submissions.length ? 
                            <p className="mb-2 text-black-50">Files Attached:
                                {submissions[0].file_id ? 
                                    <RenderContentFiles content={{ file_id: submissions[0].file_id }} /> 
                                    : <div className="fw-light fst-italic text-secondary d-inline-block mx-2">None</div>}
                            </p>
                            : (
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
                            </>)
                    }
                    <Form.Label className="text-black-50">Submission comments:</Form.Label>
                    {
                        submissions.length ? (submissions[0].submission_text ? <RenderContentBody contents={{ content_data: submissions[0].submission_text }} /> : <div className="fw-light">No comments</div>) : (
                            <>
                                <ReactQuill
                                    modules={module}
                                    theme="snow"
                                    value={value}
                                    className={`${errors.value ? 'is-invalid' : ""}`}
                                    placeholder="Write assignment comments"
                                    onChange={handleUserInfo}
                                />
                                <div className={`${errors.value ? "invalid-feedback" : ""}`}>
                                    {
                                        errors.value
                                            ? errors.value
                                            : <span aria-hidden="true" className="invisible">.</span>
                                    }
                                </div>
                            </>
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
        </div>
    );
}
 
export default AssignmentSubmission;