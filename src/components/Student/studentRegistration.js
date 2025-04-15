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

    // Validation constants
    const MIN_NAME_LENGTH = 2;
    const MAX_NAME_LENGTH = 30;
    const MIN_ADDRESS_LENGTH = 5;
    const MAX_ADDRESS_LENGTH = 50;
    const MIN_PW_LENGTH = 5;
    const MAX_PW_LENGTH = 15;
    const PHONE_REGEX = /^\+\d{1,3}-\d{7,15}$/; // +[1-3 digits]-[7-15 digits]
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [formState, setFormState] = useState({
        [inputFieldIDs.fname]: "",
        [inputFieldIDs.lname]: "",
        [inputFieldIDs.dob]: null,
        [inputFieldIDs.email]: "",
        [inputFieldIDs.phone]: "",
        [inputFieldIDs.address]: "",
        [inputFieldIDs.ProgramType]: null,
        [inputFieldIDs.startSemester]: null,
        [inputFieldIDs.program]: null,
        [inputFieldIDs.exampleInputPassword1]: "",
        [inputFieldIDs.confirmPW]: "",
        [inputFieldIDs.emailError]: "",
    });

    const [errors, setErrors] = useState({
        [inputFieldIDs.fname]: "",
        [inputFieldIDs.lname]: "",
        [inputFieldIDs.dob]: "",
        [inputFieldIDs.email]: "",
        [inputFieldIDs.phone]: "",
        [inputFieldIDs.address]: "",
        [inputFieldIDs.ProgramType]: "",
        [inputFieldIDs.program]: "",
        [inputFieldIDs.startSemester]: "",
        [inputFieldIDs.exampleInputPassword1]: "",
        [inputFieldIDs.confirmPW]: ""
    });

    const updateInput = (e) => {
        const value = e.target.value;
        const property = e.target.id;

        setFormState(prev => ({
            ...prev,
            [property]: value
        }));

        // Clear errors as user types
        if (errors[property]) {
            setErrors(prev => ({
                ...prev,
                [property]: ""
            }));
        }

        // handling for password matching
        if (property === inputFieldIDs.exampleInputPassword1) {
            if (value.length >= MIN_PW_LENGTH && value.length <= MAX_PW_LENGTH) {
                setErrors(prev => ({
                    ...prev,
                    [inputFieldIDs.exampleInputPassword1]: "",
                    [inputFieldIDs.confirmPW]: value === formState[inputFieldIDs.confirmPW] ? "" : prev[inputFieldIDs.confirmPW]
                }));
            }
        } else if (property === inputFieldIDs.confirmPW) {
            if (value === formState[inputFieldIDs.exampleInputPassword1]) {
                setErrors(prev => ({
                    ...prev,
                    [inputFieldIDs.exampleInputPassword1]: "",
                    [inputFieldIDs.confirmPW]: ""
                }));
            }
        }
    }

    const validateForm = () => {
        let valid = true;
        const newErrors = { ...errors };

        // Validate first name
        if (formState[inputFieldIDs.fname].trim().length < MIN_NAME_LENGTH || 
            formState[inputFieldIDs.fname].trim().length > MAX_NAME_LENGTH) {
            valid = false;
            newErrors[inputFieldIDs.fname] = `First name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`;
        }

        // Validate last name
        if (formState[inputFieldIDs.lname].trim().length < MIN_NAME_LENGTH || 
            formState[inputFieldIDs.lname].trim().length > MAX_NAME_LENGTH) {
            valid = false;
            newErrors[inputFieldIDs.lname] = `Last name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`;
        }

        // Validate date of birth
        if (!formState[inputFieldIDs.dob]) {
            valid = false;
            newErrors[inputFieldIDs.dob] = "Date of birth is required";
        } else if (new Date(formState[inputFieldIDs.dob]) >= new Date()) {
            valid = false;
            newErrors[inputFieldIDs.dob] = "Date of birth must be in the past";
        }

        // Validate email
        if (!EMAIL_REGEX.test(formState[inputFieldIDs.email])) {
            valid = false;
            newErrors[inputFieldIDs.email] = "Please enter a valid email address";
        }

        // Validate phone
        if (!PHONE_REGEX.test(formState[inputFieldIDs.phone])) {
            valid = false;
            newErrors[inputFieldIDs.phone] = "Phone must be in format +(country code)-(number)";
        }

        // Validate address
        if (formState[inputFieldIDs.address].trim().length < MIN_ADDRESS_LENGTH || 
            formState[inputFieldIDs.address].trim().length > MAX_ADDRESS_LENGTH) {
            valid = false;
            newErrors[inputFieldIDs.address] = `Address must be between ${MIN_ADDRESS_LENGTH} and ${MAX_ADDRESS_LENGTH} characters`;
        }

        // Validate program type
        if (!formState[inputFieldIDs.ProgramType] || formState[inputFieldIDs.ProgramType] == 0) {
            valid = false;
            newErrors[inputFieldIDs.ProgramType] = "Please select a program type";
        }

        // Validate program
        if (!formState[inputFieldIDs.program] || formState[inputFieldIDs.program] == 0) {
            valid = false;
            newErrors[inputFieldIDs.program] = "Please select a program";
        }

        // Validate start semester
        if (!formState[inputFieldIDs.startSemester] || formState[inputFieldIDs.startSemester] == 0) {
            valid = false;
            newErrors[inputFieldIDs.startSemester] = "Please select a start semester";
        }

        // Validate password
        if (formState[inputFieldIDs.exampleInputPassword1].length < MIN_PW_LENGTH || 
            formState[inputFieldIDs.exampleInputPassword1].length > MAX_PW_LENGTH) {
            valid = false;
            newErrors[inputFieldIDs.exampleInputPassword1] = `Password must be between ${MIN_PW_LENGTH} and ${MAX_PW_LENGTH} characters`;
        } else if (formState[inputFieldIDs.exampleInputPassword1] !== formState[inputFieldIDs.confirmPW]) {
            valid = false;
            newErrors[inputFieldIDs.exampleInputPassword1] = "Passwords do not match";
            newErrors[inputFieldIDs.confirmPW] = "Passwords do not match";
        }

        setErrors(newErrors);
        return valid;
    }

    const register = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const url = URLS.register;
        const data = { ...formState }
        delete data[inputFieldIDs.confirmPW];
        delete data[inputFieldIDs.emailError];

        try {
            await axiosInstance.post(url, data)
            addToast("Registration Successful! Login using your credentials!", 'success')
            history.push("/login")
        } catch (err) {
            if (err.status = 409) {
                const data = err.data;
                setFormState(prev => ({
                    ...prev,
                    [inputFieldIDs.emailError]: data
                }))
            }
            console.log(err);
        }
    }

    const renderProgramTypes = (programTypes) => programTypes.map(pt => <option key={pt.ProgramType_ID} value={pt.ProgramType_ID}>{pt.ProgramType_Name}</option>)

    return (
        <div className="login-register d-flex flex-column justify-content-center">
            <div className='maxHeight d-flex align-items-center justify-content-center pt-5' style={{ fontSize: '0.95em' }}>
                <div className='student-register p-4 rounded my-3' style={{position: 'relative'}}>
                    <p className="text-body-secondary text-center mb-4"><h3>New Student Registration</h3></p>
                    <form>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.fname} className="form-label">First Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.fname]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.fname] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.fname}
                            />
                            <div className={`${errors[inputFieldIDs.fname] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.fname] 
                                    ? errors[inputFieldIDs.fname] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.lname} className="form-label">Last Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.lname]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.lname] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.lname}
                            />
                            <div className={`${errors[inputFieldIDs.lname] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.lname] 
                                    ? errors[inputFieldIDs.lname] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.dob} className="form-label">Date Of Birth <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                max={fetchDueDateTime(new Date()).formattedDate()}
                                value={formState[inputFieldIDs.dob]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.dob] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.dob}
                            />
                            <div className={`${errors[inputFieldIDs.dob] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.dob] 
                                    ? errors[inputFieldIDs.dob] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.email} className="form-label">Email <span className="text-danger">*</span></label>
                            <input
                                type="email"
                                value={formState[inputFieldIDs.email]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.email] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.email}
                            />
                            <div className={`${errors[inputFieldIDs.email] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.email] 
                                    ? errors[inputFieldIDs.email] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.phone} className="form-label">Phone <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.phone]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.phone] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.phone}
                                placeholder="e.g. +1-9899999999"
                            />
                            <div className={`${errors[inputFieldIDs.phone] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.phone] 
                                    ? errors[inputFieldIDs.phone] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.address} className="form-label">Address <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                value={formState[inputFieldIDs.address]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.address] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.address}
                            />
                            <div className={`${errors[inputFieldIDs.address] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.address] 
                                    ? errors[inputFieldIDs.address] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.ProgramType} className="form-label">Program Type <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${errors[inputFieldIDs.ProgramType] ? 'is-invalid' : ''}`}
                                aria-label="Select a program type"
                                value={formState[inputFieldIDs.ProgramType]}
                                onChange={updateInput}
                                id={inputFieldIDs.ProgramType}
                            >
                                <option value={0}>Select a program type</option>
                                {programTypes && renderProgramTypes(programTypes)}
                            </select>
                            <div className={`${errors[inputFieldIDs.ProgramType] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.ProgramType] 
                                    ? errors[inputFieldIDs.ProgramType] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.program} className="form-label">Program <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${errors[inputFieldIDs.program] ? 'is-invalid' : ''}`}
                                aria-label="Select a program"
                                value={formState[inputFieldIDs.program]}
                                onChange={updateInput}
                                id={inputFieldIDs.program}
                            >
                                <option value={0}>Select a program</option>
                                {programs && renderPrograms(programs, formState[inputFieldIDs.ProgramType])}
                            </select>
                            <div className={`${errors[inputFieldIDs.program] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.program] 
                                    ? errors[inputFieldIDs.program] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.startSemester} className="form-label">Start Semester <span className="text-danger">*</span></label>
                            <select
                                className={`form-select form-control ${errors[inputFieldIDs.startSemester] ? 'is-invalid' : ''}`}
                                aria-label="Select a start semester"
                                value={formState[inputFieldIDs.startSemester]}
                                onChange={updateInput}
                                id={inputFieldIDs.startSemester}
                            >
                                <option value={0}>Choose a start semester</option>
                                {semesters && renderSemesters(semesters)}
                            </select>
                            <div className={`${errors[inputFieldIDs.startSemester] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.startSemester] 
                                    ? errors[inputFieldIDs.startSemester] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.exampleInputPassword1} className="form-label">Password <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                value={formState[inputFieldIDs.exampleInputPassword1]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.exampleInputPassword1] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.exampleInputPassword1}
                                placeholder={`${MIN_PW_LENGTH}-${MAX_PW_LENGTH} characters`}
                            />
                            <div className={`${errors[inputFieldIDs.exampleInputPassword1] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.exampleInputPassword1] 
                                    ? errors[inputFieldIDs.exampleInputPassword1] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
                            </div>
                        </div>
                        <div className=" input">
                            <label htmlFor={inputFieldIDs.confirmPW} id={`${inputFieldIDs.confirmPW}Label`} className="form-label">Confirm Password <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                value={formState[inputFieldIDs.confirmPW]}
                                onChange={updateInput}
                                className={`form-control ${errors[inputFieldIDs.confirmPW] ? 'is-invalid' : ''}`}
                                id={inputFieldIDs.confirmPW}
                                aria-describedby={`${inputFieldIDs.confirmPW}Label`}
                                placeholder="Confirm password"
                            />
                            <div className={`${errors[inputFieldIDs.confirmPW] ? "invalid-feedback" : ""}`}>
                                {errors[inputFieldIDs.confirmPW] 
                                    ? errors[inputFieldIDs.confirmPW] 
                                    : <span aria-hidden="true" className="invisible">.</span>}
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