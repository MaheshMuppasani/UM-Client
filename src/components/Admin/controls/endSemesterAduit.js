import { useState } from "react";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import axiosInstance from "../../../axiosInstance";
import { useToast } from "../../../AppToast";
import { URLS } from "../../../assets/urlConstants";
import { useConstants } from "../../../constantsProvider";
import { capitalizeFirstLetter } from "../../Student/studentEnrollment";

// Step Titles
const stepTitles = {
    step1: 'Check Grades Status',
    step2: 'Update Course Progress',
    step3: 'Save Student Progress & Change Semester',
};

// Step Descriptions
const stepDescriptions = {
    step1: 'Checking grades for all students...',
    step2: 'Updating course progress for all students...',
    step3: 'Saving Student progress & Changing Semester...',
};

const EndSemesterAudit = (props) => {
    const [stepStatus, setStepStatus] = useState({
        step1: { active: 0, percentage: 0, failed: false, message: stepDescriptions.step1, success: false },
        step2: { active: 0, percentage: 0, failed: false, message: stepDescriptions.step2, success: false },
        step3: { active: 0, percentage: 0, failed: false, message: stepDescriptions.step3, success: false },
    });
    const [currentStep, setCurrentStep] = useState(1); // Track the current step
    const [processing, setProcessing] = useState(false);
    const [logTable, setLogTable] = useState(null);
    const { constants } = useConstants();
    const { semesters } = constants;
    const currentSemester = semesters.find(sem => sem.is_current_semester)

    
    const updateStepStatus = (stepKey, status) => {
        setStepStatus((prev) => ({
            ...prev,
            [stepKey]: {
                ...prev[stepKey],
                ...status,
            },
        }));
    };

    const stepActions = {
        step1: async () => {
            const url = URLS.checkAllGradesWerePosted;
            return axiosInstance.get(url);
        },
        step2: async () => {
            const url = URLS.updateCourseEnrollmentsStatus;
            return axiosInstance.put(url);
        },
        step3: async () => {
            const url = URLS.saveProgressAndChangeSemester
            return axiosInstance.put(url);
        },
    };

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const isEveryStepSuccess = Object.values(stepStatus).every((step) => step.success)

    const refreshPage = () => {
        localStorage.setItem('reload', Date.now());
        window.location.reload(true);
    }

    const handleStep = async () => {
        if(isEveryStepSuccess){
            refreshPage();
            return;
        }

        const stepKey = `step${currentStep}`;
        let interval;
        let progress = 0;
        setProcessing(true);
        try {
            // Retry the failed step or process the current step
            setLogTable(null);
            updateStepStatus(stepKey, { active: 1, percentage: 0, failed: false, message: stepDescriptions[stepKey], success : false });

            interval = setInterval(() => {
                progress += progress >= 100 ? 0 :(progress > 50 ? 1 : 10);
                updateStepStatus(stepKey, { percentage: progress });
                // if (progress >= 100) {
                //     clearInterval(interval);
                // }
            }, 100);

            await delay(1000);
            const response = await stepActions[stepKey](); // Call the corresponding API
            updateStepStatus(stepKey, { failed: false, success : true, percentage: 100, message: response?.data?.message || 'Success' });
            clearInterval(interval);
            // Move to the next step or complete the process
            if (currentStep < 3) {
                setCurrentStep((prev) => prev + 1);
            } else {
                // alert('Semester audit completed successfully!');
                // resetAudit();
            }
        } catch (err) {
            if(interval) clearInterval(interval);
            setLogTable(err?.data?.data || err?.data?.message || 'An unexpected error occurred.')
            updateStepStatus(stepKey, { success : false ,failed: true, percentage: 100, message: err?.data?.message || 'An unexpected error occurred.' });
        } finally {
            setProcessing(false);
        }
    };

    const closeModal = () => {
        if(isEveryStepSuccess){
            refreshPage();
        } else{
            props.onHide();
        }

    }

    const isAuditStarted = Object.values(stepStatus).some((step) => step.active); // Check if any step has started
    const hasFailed = Object.values(stepStatus).some((step) => step.failed); // Check if any step has failed

    // const currentStep = Object.entries(stepStatus).find(([key, step]) => step.message)[1].message

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            backdrop="static"
            keyboard={false}
            centered
            onHide={closeModal}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    End of Semester Audit - {capitalizeFirstLetter(currentSemester.semester_term)} {currentSemester.semester_year}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="px-40 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-column flex-1">
                        {Object.entries(stepStatus).map(([key, step], index) => (
                            <div
                                key={key}
                                className={`flex flex-col gap-3 px-3 py-1 ${step.active ? '' : 'text-black-50'}`}
                            >
                                <div className="flex justify-between">
                                    <p>{`Step ${index + 1}: ${stepTitles[key]}`}</p>
                                </div>
                                <div className="rounded">
                                    <ProgressBar
                                        striped={step.active && !step.success && !step.failed}
                                        animated={step.active && !step.success && !step.failed ? true : false}
                                        variant={step.failed ? 'danger' : (step.success ? 'success' : 'secondary')}
                                        now={step.percentage}
                                    />
                                </div>
                                <p
                                    style={{ fontSize: '0.85rem' }}
                                    className={`${step.active ? '' : 'invisible'} ${step.failed ? 'text-danger' : (step.success ? "text-success" : 'text-body-secondary')}`}
                                    aria-hidden={`${step.active ? 'false' : 'true'}`}
                                >
                                    {step.message}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="px-3 m-0 mb-1">Audit Log:</p>
                    <div className="d-flex flex-column mx-2 px-3 py-2 border rounded bg-dark text-white" style={{height: '200px', overflow: "auto", fontFamily: 'monospace'}}>
                        {
                            logTable?.ungradedEnrollments && (
                                logTable?.ungradedEnrollments.map(en => {
                                    const { SectionID, enrollments, CourseID } = en;
                                    return <span>{">> "}Section-{SectionID} With CourseID:{CourseID} did not received grades for {enrollments.length} student(s)</span>
                                })
                            )
                        }
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleStep} disabled={processing}>
                    {processing
                        ? 'Processing...'
                        : hasFailed
                        ? 'Try Again'
                        : isEveryStepSuccess
                        ? 'Refresh Application'
                        : isAuditStarted
                        ? 'Continue'
                        : 'Start Audit'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EndSemesterAudit;