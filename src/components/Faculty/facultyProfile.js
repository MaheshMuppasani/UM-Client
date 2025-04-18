import { useEffect, useState } from "react";
import { ProfileDataField } from "../Student/StudentProfile.js";
import axios from "../../axiosInstance.js";
import { URLS } from "../../assets/urlConstants.js";
import { useConstants } from "../../constantsProvider.js";
import { useUserRole } from "../../userRole.js";
import { adminContact } from "../../assets/constants.js";


export const getDepartment = (dptId, departs) => {
    if(!departs) return null;
    const dpt = departs.find(dpt => dpt.Department_ID===dptId);
    if(dpt) return dpt.Department_Name;
    return null;
}

const FacultyProfile = (props) => {
    const { constants } = useConstants();
    const { isAdmin } = useUserRole();
    const { departments } = constants;
    const [profile, setProfile] = useState({});

    const getBasicInfo = (profile) => {
        const ProfileOptions = {
            'First Name': profile.FirstName,
            'Last Name': profile.LastName,
            'Date of Birth': 'NOT PROVIDED',
            'Email': profile.Email,
            'Phone': profile.Phone || 'NOT PROVIDED',
            'Address': profile.Address || 'NOT PROVIDED',
            'Department': getDepartment(profile.DepartmentID, departments),
            'Designation': profile.Designation || 'Faculty',
        }
        if(isAdmin()){
            ProfileOptions.Designation = "Administration"
            ProfileOptions["Role"] = "Super-Admin"
        }
        return ProfileOptions; 
    }

    const getAcademicInfo = (profile) => {
        const info = {
            'Education': profile.Education,
            'Linkedin': null,
            'Website': null,
        }
        if(isAdmin()){
            info.Linkedin = <a href={adminContact.linkedin} target="_blank">{adminContact.linkedin}</a>;
            info.Website = <a href={adminContact.website} target="_blank">{adminContact.website}</a>
        }
        return info;
    }

    useEffect(() => {
        axios.get(URLS.facultyME)
            .then(data => {
              setProfile(data.data);
            }).catch(err => {
              alert(JSON.stringify(err))
            })
      }, [])

    return (
        <div className="StudentProfile">
            <h2 className="mb-3 d-flex gap-4 align-items-center">
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
        </div>
    );
}

export default FacultyProfile;