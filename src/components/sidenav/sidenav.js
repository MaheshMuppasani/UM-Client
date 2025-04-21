import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUserRole } from "../../userRole";
import EndSemesterAduit from "../Admin/controls/endSemesterAduit";
import { useConstants } from "../../constantsProvider";
import { capitalizeFirstLetter } from "../Student/studentEnrollment";

const LogOutIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
            <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
        </svg>
    )
}

const SideNav = (props) => {
    const { isFaculty, isAdmin, isStudent } = useUserRole();

    const location = useLocation();
    const [endSemesterModal, setEndSemesterModal] = useState(false);
    const [tab, setTab] = useState(null);
    const { constants } = useConstants();
    const { semesters } = constants;
    const currentSemester = semesters?.find(sem => sem.is_current_semester) || null;


    useEffect(() => {
        setTab(() => {
            // Determine initial tab based on the current URL
            if (location.pathname.startsWith('/profile')) return 0;
            if (location.pathname.startsWith('/enrollments')) return 1;
            if (location.pathname.startsWith('/courses')) return 2;
            if (location.pathname.startsWith('/announcements')) return 3;
            if (location.pathname.startsWith('/payments')) return 4;
            // if (location.pathname.startsWith('/students')) return 5;
            if (location.pathname.startsWith('/faculty')) return 6;
            // if (location.pathname.startsWith('/manage-users')) return 7;
            if (location.pathname.startsWith('/programs')) return 8;
            if (location.pathname.startsWith('/calendar')) return 9;
            if (location.pathname.startsWith('/dashboard')) return 10;
            return null; // Default tab
        })
    }, [location.pathname])


    const closeEndSemesterModal = (e) => {
        if (e) e.stopPropagation();
        setEndSemesterModal(false);
    }

    const toggleEndSemesterModal = () => setEndSemesterModal(!endSemesterModal);

    const handleRunSemesterReport = () => {

    }

    return (<div className={`sideNav d-flex flex-column ${props.isOpen ? '' : 'collapse'}`}>
        <div className="list-inline list-group list-group-flush">
            {
                isStudent() ? (
                    <>
                        <Link to="/profile" onClick={() => setTab(0)} className={`list-group-item list-group-item-action ${tab === 0 ? 'active' : ''}`}>Profile</Link>
                        <Link to={"/courses"} onClick={() => setTab(2)} className={`list-group-item list-group-item-action ${tab === 2 ? 'active' : ''}`}>Courses</Link>
                        <Link to="/enrollments" onClick={() => setTab(1)} className={`list-group-item list-group-item-action ${tab === 1 ? 'active' : ''}`} >Enrollments</Link>
                        <Link to={"/payments"} onClick={() => setTab(4)} className={`list-group-item list-group-item-action ${tab === 4 ? 'active' : ''}`}>Payments</Link>
                        <Link to={"/calendar"} onClick={() => setTab(9)} className={`list-group-item list-group-item-action ${tab === 9 ? 'active' : ''}`}>Calendar</Link>
                    </>
                ) : ("")
            }
            {
                isFaculty() ? (
                    <>
                        <Link to="/profile" onClick={() => setTab(0)} className={`list-group-item list-group-item-action ${tab === 0 ? 'active' : ''}`}>Profile</Link>
                        <Link to={"/courses"} onClick={() => setTab(2)} className={`list-group-item list-group-item-action ${tab === 2 ? 'active' : ''}`}>Courses</Link>
                        <Link to={"/calendar"} onClick={() => setTab(9)} className={`list-group-item list-group-item-action ${tab === 9 ? 'active' : ''}`}>Calendar</Link>
                    </>
                ) : ("")
            }
            {
                isAdmin() ? (
                    <>
                        <Link to={"/dashboard"} onClick={() => setTab(10)} className={`list-group-item list-group-item-action ${tab === 10 ? 'active' : ''}`} >Dashboard</Link>
                        <Link to={"/courses"} onClick={() => setTab(2)} className={`list-group-item list-group-item-action ${tab === 2 ? 'active' : ''}`}>Courses</Link>
                        <Link to={"/programs"} onClick={() => setTab(8)} className={`list-group-item list-group-item-action ${tab === 8 ? 'active' : ''}`} >Programs</Link>
                        <Link to={"/faculty"} onClick={() => setTab(6)} className={`list-group-item list-group-item-action ${tab === 6 ? 'active' : ''}`} >Faculty</Link>
                        <Link to="/profile" onClick={() => setTab(0)} className={`list-group-item list-group-item-action ${tab === 0 ? 'active' : ''}`}>Profile</Link>
                        <Link to={"/calendar"} onClick={() => setTab(9)} className={`list-group-item list-group-item-action ${tab === 9 ? 'active' : ''}`}>Calendar</Link>
                    </>
                ) : ("")
            }
        </div>
        <div className="list-group mt-auto" style={{ width: '200px' }}>
            {
                isAdmin() ? (
                    <>
                        <button type="button" className="py-3 list-group-item list-group-item-action d-flex align-items-center justify-content-center" onClick={handleRunSemesterReport}><span>Run Semester Report</span></button>
                        <button type="button" className="py-2 list-group-item list-group-item-action d-flex align-items-center justify-content-center" onClick={toggleEndSemesterModal}><span>End Semester {currentSemester && (<><br></br> <small>({capitalizeFirstLetter(currentSemester.semester_term)} {currentSemester.semester_year})</small></>)}</span></button>
                    </>
                ) : ("")
            }
            <button type="button" className="py-3 list-group-item list-group-item-action d-flex align-items-center justify-content-center" onClick={props.logOut}><LogOutIcon /><span className="mx-3">Log out</span></button>
        </div>
        {
            endSemesterModal && (
                <EndSemesterAduit
                    show={endSemesterModal}
                    onHide={closeEndSemesterModal}
                />
            )
        }
    </div>);
}

export default SideNav;