import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { capitalizeFirstLetter } from "./studentEnrollment";
import { validateEmail } from "../Login page/login";
import { useToast } from "../../AppToast.js";
import { fetchDueDateTime } from "../../utils/utils.js";
import { URLS } from "../../assets/urlConstants.js";
import { useConstants } from "../../constantsProvider.js";

const inputFieldIDs = {
    fname: 'FirstName',
    lname: 'LastName',
    dob: 'DOB',
    email: 'Email',
    phone: 'PhoneNumber',
    address: 'Address',
    ProgramType: 'ProgramTypeID',
    program: 'ProgramID',
    startSemester: 'StartSemesterID',
    exampleInputPassword1: 'passwordHash',
    confirmPW: 'confirmPW',
    pwError: 'pwError',
    emailError: 'emailError'
}

export const renderDepartments = (departments) => departments.map(d => <option key={d.Department_ID} value={d.Department_ID}>{d.Department_Name}</option>)

export const renderSemesters = (semesters) => semesters.map(s => s.isEnrollable && <option key={s.semester_id} value={s.semester_id}>{capitalizeFirstLetter(s.semester_term)} {s.semester_year} {s.is_current_semester ? '(Current Term)' : ''}</option>)
export const renderPrograms = (programs, ptID = 0, dpts) => {
    return programs?.filter(p => !ptID ? true : p.ProgramTypeID == ptID).map(p => <option key={p.ProgramID} value={p.ProgramID}>{p.Program_Name}{dpts ? `  [${(dpts.find(d => d.Department_ID === p.DepartmentID)?.Department_Code)} department]` : ("")}</option>)
}

const RegisterStudent = (props) => {
    const history = useHistory();
    const { addToast } = useToast();
    const { constants } = useConstants();

    const { programTypes, programs, semesters } = constants;

    const [formState, setFormState] = useState(
        {
            [inputFieldIDs.fname]: "",
            fNameError: "",
            [inputFieldIDs.lname]: "",
            lNameError: "",
            [inputFieldIDs.dob]: null,
            [inputFieldIDs.email]: "",
            [inputFieldIDs.phone]: "",
            [inputFieldIDs.address]: "",
            [inputFieldIDs.ProgramType]: null,
            programTypeError: "",
            [inputFieldIDs.startSemester]: null,
            semesterError: "",
            [inputFieldIDs.program]: null,
            programError: "",
            [inputFieldIDs.exampleInputPassword1]: "",
            passWordError: "",
            [inputFieldIDs.confirmPW]: "",
            [inputFieldIDs.pwError]: false,
            [inputFieldIDs.emailError]: "",
        });

    const updateInput = (e) => {
        const tempForm = { ...formState };
        const value = e.target.value;
        const property = e.target.id;

        setFormState({
            ...tempForm,
            [property]: value
        })
    }

    const validateForm = (formState) => {
        let validationError = false;
        if (!formState[inputFieldIDs.fname]) {
            validationError = true;
            formState.fNameError = "First name is required!"
        } else {
            formState.fNameError = "";
        }
        if (!formState[inputFieldIDs.lname]) {
            validationError = true;
            formState.lNameError = "First name is required!";
        } else {
            formState.lNameError = "";
        }
        if (!formState[inputFieldIDs.email]) {
            validationError = true;
            formState[inputFieldIDs.emailError] = "Email is required!"
        } else if (!validateEmail(formState[inputFieldIDs.email])) {
            validationError = true;
            formState[inputFieldIDs.emailError] = "Invalid email address!"
        } else {
            formState[inputFieldIDs.emailError] = ""
        }
        if (!formState[inputFieldIDs.ProgramType]) {
            validationError = true;
            formState.programTypeError = "Please choose a program type!"
        } else {
            formState.programTypeError = ""
        }
        if (!formState[inputFieldIDs.program]) {
            validationError = true;
            formState.programError = "Please choose a program!"
        } else {
            formState.programError = "";
        }
        if (!formState[inputFieldIDs.startSemester]) {
            validationError = true;
            formState.semesterError = "Please choose a semester!"
        } else {
            formState.semesterError = ""
        }
        if (!formState[inputFieldIDs.exampleInputPassword1]) {
            validationError = true;
            formState.passWordError = "Password is required!"
        } else {
            formState.passWordError = ""
        }
        if (formState[inputFieldIDs.exampleInputPassword1]) {
            if (!formState[inputFieldIDs.confirmPW]) {
                validationError = true;
                formState[inputFieldIDs.pwError] = "Please Confirm Your Password!"
            } else if (formState[inputFieldIDs.confirmPW] !== formState[inputFieldIDs.exampleInputPassword1]) {
                validationError = true;
                formState[inputFieldIDs.pwError] = "Passwords do not match!"
            } else {
                formState[inputFieldIDs.pwError] = ""
            }
        }
        return [formState, validationError];
    }

    const register = async (e) => {
        e.preventDefault();
        const [validatedForm, validationError] = validateForm({ ...formState });
        if (validationError) {
            setFormState(validatedForm);
            return;
        }
        const url = URLS.register;
        const data = { ...formState }
        delete data[inputFieldIDs.confirmPW];
        delete data[inputFieldIDs.pwError];
        delete data[inputFieldIDs.emailError];
        delete data.fNameError;
        delete data.lNameError;
        delete data.programTypeError;
        delete data.programError;
        delete data.semesterError;
        delete data.passWordError;

        try {
            const response = await axiosInstance.post(url, data)
            addToast("Registration Successful! Login using your credentials!", 'success')
            history.push("/login")
        } catch (err) {
            if (err.status = 409) {
                const data = err.data;
                setFormState({
                    ...formState,
                    [inputFieldIDs.emailError]: data
                })
            }
            console.log(err);
        }
    }

    const renderProgramTypes = (programTypes) => programTypes.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)

    return (
        <div className="login-register d-flex flex-column justify-content-center">
            <div className='maxHeight d-flex align-items-center justify-content-center pt-5' style={{ fontSize: '0.8em' }}>
                <div className='student-register p-4 rounded my-3' style={{position: 'relative'}}>
                    <p className="text-body-secondary text-center mb-4"><h3>New Student Registration</h3></p>
                    <form>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.fname} className="form-label">First Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.fname]}
                                onChange={updateInput}
                                className={`form-control ${formState.fNameError ? 'is-invalid' : ""}`}
                                id={inputFieldIDs.fname}
                            />
                            <div id="validationFNameFeedback" class={`${formState.fNameError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.fNameError
                                        ? formState.fNameError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.lname} className="form-label">Last Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.lname]}
                                onChange={updateInput}
                                className={`form-control ${formState.lNameError ? 'is-invalid' : ""}`}
                                id={inputFieldIDs.lname}
                            />
                            <div id="validationLNameFeedback" class={`${formState.lNameError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.lNameError
                                        ? formState.lNameError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.dob} className="form-label">Date Of Birth</label>
                            <input
                                type="date"
                                max={fetchDueDateTime(new Date()).formattedDate()}
                                value={formState[inputFieldIDs.dob]}
                                onChange={updateInput}
                                className="form-control"
                                id={inputFieldIDs.dob}
                            />
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.email} className="form-label">Email <span className="text-danger">*</span></label>
                            <input
                                type="email"
                                value={formState[inputFieldIDs.email]}
                                onChange={updateInput}
                                className={`form-control ${formState[inputFieldIDs.emailError] ? 'is-invalid' : ""}`}
                                id={inputFieldIDs.email}
                            />
                            <div id="validationEmailFeedback" class={`${formState[inputFieldIDs.emailError] ? "invalid-feedback" : ""}`}>
                                {
                                    formState[inputFieldIDs.emailError]
                                        ? formState[inputFieldIDs.emailError]
                                        : ""
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.phone} className="form-label">Phone</label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.phone]}
                                onChange={updateInput}
                                className="form-control"
                                id={inputFieldIDs.phone}
                            />
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.address} className="form-label">Address</label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.address]}
                                onChange={updateInput}
                                className="form-control"
                                id={inputFieldIDs.address}
                            />
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.ProgramType} className="form-label">Program Type <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${formState.programTypeError ? 'is-invalid' : ""}`}
                                aria-label="Select a program type"
                                value={formState[inputFieldIDs.ProgramType]}
                                onChange={updateInput}
                                id={inputFieldIDs.ProgramType}
                            >
                                <option value={0}>Select a program type</option>
                                {
                                    programTypes && renderProgramTypes(programTypes)
                                }
                            </select>
                            <div id="validationPtypeFeedback" class={`${formState.programTypeError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.programTypeError
                                        ? formState.programTypeError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.program} className="form-label">Program <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${formState.programError ? 'is-invalid' : ""}`}
                                aria-label="Select a program"
                                value={formState[inputFieldIDs.program]}
                                onChange={updateInput}
                                id={inputFieldIDs.program}
                            >
                                <option value={0}>Select a program</option>
                                {
                                    programs && renderPrograms(programs, formState[inputFieldIDs.ProgramType])
                                }
                            </select>
                            <div id="validationProgramFeedback" class={`${formState.programError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.programError
                                        ? formState.programError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.startSemester} className="form-label">Start Semester <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${formState.semesterError ? 'is-invalid' : ""}`}
                                aria-label="Select a start semester"
                                value={formState[inputFieldIDs.startSemester]}
                                onChange={updateInput}
                                id={inputFieldIDs.startSemester}
                            >
                                <option value={0}>Choose a start semester</option>
                                {
                                    semesters && renderSemesters(semesters)
                                }
                            </select>
                            <div id="validationSemFeedback" class={`${formState.semesterError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.semesterError
                                        ? formState.semesterError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.exampleInputPassword1} className="form-label">Password <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                value={formState[inputFieldIDs.exampleInputPassword1]}
                                onChange={updateInput}
                                className={`form-control ${formState.passWordError ? 'is-invalid' : ""}`}
                                id={inputFieldIDs.exampleInputPassword1}
                            />
                            <div id="validationPWFeedback" class={`${formState.passWordError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.passWordError
                                        ? formState.passWordError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div className="mb-3 input">
                            <label for={inputFieldIDs.confirmPW} id={`${inputFieldIDs.confirmPW}Label`} className="form-label">Confirm Password <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                value={formState[inputFieldIDs.confirmPW]}
                                onChange={updateInput}
                                className={`form-control ${formState[inputFieldIDs.pwError] ? 'is-invalid' : ""}`}
                                id={inputFieldIDs.confirmPW}
                                aria-describedby={`${inputFieldIDs.confirmPW}Label validationPasswordFeedback`}
                            />
                            <div id="validationCPWFeedback" class={`${formState[inputFieldIDs.pwError] ? "invalid-feedback" : ""}`}>
                                {
                                    formState[inputFieldIDs.pwError]
                                        ? formState[inputFieldIDs.pwError]
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                    </form>
                    <div className="d-flex align-items-center">
                        <a href="/login">Already have an account? Click to Login!</a>
                        <button type="submit" className="btn btn-primary submit" onClick={register}>Submit</button>
                    </div>
                </div>
            </div>
            <div className="text-center"><p className="mt-4"><a href="/">Copyright</a> Horizon University. Mount Pleasant. MI 48858 | Phone: 989-491-1302</p></div>
        </div>
    )
}

export default RegisterStudent;