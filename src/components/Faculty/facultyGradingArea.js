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
    const fileInputRef = useRef(null);
    const { addToast } = useToast();
    const [grade, setGrade] = useState(null);

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
        if(!submissions[0].submission_id) return;
        e.preventDefault();
        e.stopPropagation();
        let url = URLS.submitGrading;
        const data = {
            submission_id: submissions[0].submission_id,
            file: file,
            feedback_text: value && value!=='<p><br></p>' ? value : null,
            grade_received: Number(grade),

        }
        axiosInstance.put(url, data, formDataHeaders)
            .then(res => {
                cancelSubmission(e)
                addToast("Assignment Graded successfully!", 'success');
            })
    }

    const module = {
        toolbar: toolbarOptions
    }

    return (<div>
        <Form className="addCourseContentForm d-flex flex-column">
            <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
            >
                {
                    submissions[0]?.grade_received ? ("") : (<div>
                    <Form.Label className="text-black-50">Grade</Form.Label>
                    <div className="d-flex align-items-baseline gap-3">
                        <Form.Control
                            value={grade}
                            onChange={e=>setGrade(e.target.value)}
                            style={{ width: "150px" }}
                            className="mb-3"
                            type="number"
                            placeholder="Enter a grade" />
                        <div className="fw-light">/ {MaximumScore} points</div>
                    </div>
                </div>)
                }
                
                {
                    submissions[0]?.grade_received ? (submissions[0].feedback_fileID ? <RenderContentFiles content={{ file_id: submissions[0].feedback_fileID }} /> : <div className="fw-light">No files attached</div>) : (
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
                <Form.Label className="text-black-50">Feedback comments or text:</Form.Label>
                {
                    submissions[0]?.grade_received ? (submissions[0].feedback_text ? <RenderContentBody contents={{ content_data: submissions[0].feedback_text }} /> : <div className="fw-light">No feedback provided</div>) : (
                        <ReactQuill
                            modules={module}
                            theme="snow"
                            value={value}
                            placeholder="Write feedback comments"
                            onChange={setuserInfo}
                        />
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
    </div>);
}

export default FacultyGradingArea;