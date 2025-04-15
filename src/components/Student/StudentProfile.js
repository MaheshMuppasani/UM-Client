import { useEffect, useState } from "react";
import axios from "../../axiosInstance.js";
import { DateToDOBFormat, getColorForGrade } from "../../utils/utils.js";
import { capitalizeFirstLetter } from "./studentEnrollment.js";
import { URLS } from "../../assets/urlConstants.js";
import { useConstants } from "../../constantsProvider.js";

export const ProfileDataField = (props) => {
    return (
        <tr className="d-flex">
            <td className="w-50 text-break">{props.name}</td>
            <td className="w-50 text-break">{props.value}</td>
        </tr>
    )
}

export const getProgramType = (programTypeID, programTypes) => {
    if(!programTypes) return null;
    const pt = programTypes.find(pt => pt.ProgramType_ID===programTypeID);
    if(pt) return pt.ProgramType_Name;
    return null;
}

export const getProgram = (prID, programs) => {
    if(!programs) return null;
    const p = programs.find(p => p.ProgramID===prID);
    if(p) return p.Program_Name;
    return null;
}

export const getCurrentSem = (semID, semesters) => {
    if(!semesters) return null;
    const semester = semesters.find(s => s.semester_id === semID);
    if (!semester) return null;
    return capitalizeFirstLetter(semester.semester_term + ' ' + semester.semester_year);
}
const StudentProfile = (props) => {
    const { constants } = useConstants();
    
    const { programTypes, programs, semesters } = constants;
    const [profile, setProfile] = useState({});


    const getBasicInfo = (profile) => {
        return {
            'First Name': profile.FirstName,
            'Last Name': profile.LastName,
            'Date of Birth': DateToDOBFormat(profile.DOB),
            'Email': profile.Email,
            'Phone': profile.PhoneNumber,
            'Address': profile.Address
        }
    }

    const getAcademicInfo = (profile) => {
        return {
            'Program Type': getProgramType(profile.ProgramTypeID, programTypes),
            'Program': getProgram(profile.ProgramID, programs),
            'Major': getProgram(profile.ProgramID, programs),
            'CGPA': profile.GPA ? <span className="badge px-3 fs-6" style={{ backgroundColor: getColorForGrade(parseFloat(profile.GPA), 4) }}>{profile.GPA}  / {4}</span> : "",
            'Start Semester': getCurrentSem(profile.StartSemesterID, semesters) || null,
            'Credit Hours Completed': profile.CreditHoursCompleted || 0,
            'Credit Hours Enrolled This Semester': profile.CreditHoursEnrolled || 0,
        }
    }

    useEffect(() => {
        axios.get(URLS.studentME)
            .then(data => {
              setProfile(data.data);
            }).catch(err => {
              alert(JSON.stringify(err))
            })
      }, [])

    return (
        <div className="StudentProfile">
            <h2 className="mb-3">
                <p className="m-0 fw-lighter">Profile</p>
            </h2>
            <div>
                <div className="basicInfo">
                    <p className="fs-4">Personal Information</p>
                    <table className="table studentInfo">
                        <tbody>
                            {
                                profile && Object.entries(getBasicInfo(profile)).map(([key, value]) => <ProfileDataField key={key} name={key} value={value} />)
                            }
                        </tbody>
                    </table>
                </div>
                <div className="contactInfo">
                    <p className="fs-4">Academic Information</p>
                    <table className="table studentInfo">
                        <tbody>
                            {
                                profile && Object.entries(getAcademicInfo(profile)).map(([key, value]) => <ProfileDataField key={key} name={key} value={value} />)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
}

export default StudentProfile;