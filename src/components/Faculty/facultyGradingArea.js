import { Button, Form } from "react-bootstrap";
import { excludedExtensions, toolbarOptions } from "../../assets/constants";
import axiosInstance from "../../axiosInstance";
import { useToast } from "../../AppToast";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import RenderContentFiles from "../Course/courseContentfiles";
import { RenderContentBody } from "../Course/tabs/courseContentTab";
import { formDataHeaders, URLS } from "../../assets/urlConstants";

const FacultyGradingArea = (props) => {
    const { submissions, cancelSubmission, exam_id, SectionID, MaximumScore, Student_ID } = props;

    const [value, setuserInfo] = useState('');
    const [file, setFile] = useState(null);
    const [grade, setGrade] = useState(null);
    const [errors, setErrors] = useState({
        grade: "",
        value: ""
    });
    const fileInputRef = useRef(null);
    const { addToast } = useToast();

    const feedback_min_length = 10;

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

    const handleGradeChange = (e) => {
        const score = Number(e.target.value);
        setGrade(e.target.value);
        if(!isNaN(score) && score >= 0 && score <= MaximumScore && errors.grade){
            setErrors({...errors, grade: ""});
        }
    }

    const handleUserInfo = (text) => {
        let editorPlainText = getPlainText(text).trim();
        if(editorPlainText.length >= feedback_min_length && errors.value){
            setErrors({...errors, value: ""});
        }
        return setuserInfo(text);
    }

    const validateForm = () => {
        let tempForm = { ...errors };
        let valid = true;
        let editorPlainText = getPlainText(value).trim();

        // Validate grade
        const numericGrade = Number(grade);
        if(isNaN(numericGrade) || grade === null || numericGrade < 0 || numericGrade > MaximumScore){
            valid = false;
            tempForm.grade = `Score must be between 0 and ${MaximumScore}`;
        } else {
            tempForm.grade = "";
        }

        // Validate feedback comments
        if(editorPlainText.length < feedback_min_length){
            valid = false;
            tempForm.value = `Feedback should be at least ${feedback_min_length} characters`;
        } else {
            tempForm.value = "";
        }

        return [valid, tempForm];
    }

    const handleSubmit = async (e) => {
        if(!submissions[0]?.submission_id) return;
        e.preventDefault();
        e.stopPropagation();
        
        const [validForm, tempForm] = validateForm();
        setErrors(tempForm);
        if(!validForm) return;

        let url = URLS.submitGrading;
        const data = {
            submission_id: submissions[0].submission_id,
            file: file,
            feedback_text: value && value!=='<p><br></p>' ? value : null,
            grade_received: Number(grade),
        }
        axiosInstance.put(url, data, formDataHeaders)
            .then(res => {
                cancelSubmission(e);
                addToast("Assignment Graded successfully!", 'success');
            })
    }

    const module = {
        toolbar: toolbarOptions
    }

    return (
        <div>
            <Form className="addCourseContentForm d-flex flex-column">
                <Form.Group
                    controlId="exampleForm.ControlTextarea1"
                >
                    {
                        submissions[0]?.grade_received ? ("") : (
                            <div>
                                <Form.Label className="text-black-50">Score</Form.Label>
                                <div className="d-flex align-items-baseline gap-3">
                                    <Form.Control
                                        value={grade}
                                        onChange={handleGradeChange}
                                        style={{ width: "150px" }}
                                        className={`mb-3 ${errors.grade ? 'is-invalid' : ""}`}
                                        type="number"
                                        min={0}
                                        max={MaximumScore}
                                        placeholder="Enter a score"
                                    />
                                    <div className="fw-light">/ {MaximumScore} points</div>
                                    <div className={`w-auto ${errors.grade ? "invalid-feedback" : ""}`}>
                                        {
                                            errors.grade
                                                ? errors.grade
                                                : <span aria-hidden="true" className="invisible">.</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    
                    {
                        submissions[0]?.grade_received ? 
                            <p className="mb-2 text-black-50">Files Attached:
                                {submissions[0].feedback_fileID 
                                ? <RenderContentFiles content={{ file_id: submissions[0].feedback_fileID }} /> 
                                : <div className="fw-light fst-italic text-secondary d-inline-block mx-2">None</div>} 
                            </p>
                            : (
                            <>
                                <Form.Label className="text-black-50">Upload Feedback file</Form.Label>
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
                    <Form.Label className="text-black-50">Feedback comments:</Form.Label>
                    {
                        submissions[0]?.grade_received ? (submissions[0].feedback_text ? <RenderContentBody contents={{ content_data: submissions[0].feedback_text }} /> : <div className="fw-light">No feedback provided</div>) : (
                            <>
                                <ReactQuill
                                    modules={module}
                                    theme="snow"
                                    value={value}
                                    className={`${errors.value ? 'is-invalid' : ""}`}
                                    placeholder="Write feedback comments"
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
                    !submissions[0]?.grade_received && Student_ID && <div className="align-self-end d-flex gap-3">
                        <Button className="btn-sm btn-secondary" onClick={cancelSubmission}>Cancel</Button>
                        <Button className="btn-sm" type="submit" onClick={handleSubmit}>Submit Grade</Button>
                    </div>
                }
            </Form>
        </div>
    );
}

export default FacultyGradingArea;