import { useState } from "react";
import CourseContentTab from "./tabs/courseContentTab";
import CourseAnnouncementTab from "./tabs/courseAnnouncementsTab";
import CourseGradesTab from "./tabs/courseGradesTab";
import AssignmentSubmissionsTab from "./tabs/assignmentSubmissionsTab";
import { useUserRole } from "../../userRole";
import CourseAssignmentTab from "./tabs/courseAssignmentsTab";

const CourseContentPage = (props) => {
    const { selectedSection, contentStack, setContentStack, popContent } = props;
    const { isStudent } = useUserRole();
    const [tabSelected, setTabSelected] = useState(1);


    const handleTabClick = (e) => {
        setContentStack([]);
        setTabSelected(e.target.value)
    }

    return (
        <div className="maxHeight">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button
                        className={`w-100 nav-link text-center ${tabSelected == 1 ? 'active' : ''}`}
                        onClick={handleTabClick}
                        value={1}
                    >Announcements</button>
                </li>
                <li className="nav-item">
                    <button
                        className={`w-100 nav-link text-center ${tabSelected == 0 ? 'active' : ''}`}
                        onClick={handleTabClick}
                        value={0}
                    >Content</button>
                </li>
                <li className="nav-item">
                    <button
                        className={`w-100 nav-link text-center ${tabSelected == 5 ? 'active' : ''}`}
                        onClick={handleTabClick}
                        value={5}
                    >Assignments</button>
                </li>
                {
                    !isStudent() && (
                        <li className="nav-item">
                            <button
                                className={`w-100 nav-link text-center ${tabSelected == 4 ? 'active' : ''}`}
                                onClick={handleTabClick}
                                value={4}
                            >Assignment Submissions</button>
                        </li>
                    )
                }
                <li className="nav-item">
                    <button
                        className={`w-100 nav-link text-center ${tabSelected == 3 ? 'active' : ''}`}
                        onClick={handleTabClick}
                        value={3}
                    >Grades</button>
                </li>
            </ul>
            {
                tabSelected == 0 ? (
                    <CourseContentTab
                        contentStack={contentStack}
                        setContentStack={setContentStack}
                        popContent={popContent}
                        selectedSection={selectedSection}
                    />
                ) : (
                    tabSelected == 1 ? (
                        <CourseAnnouncementTab
                            selectedSection={selectedSection}
                        />
                    )
                        : (tabSelected == 3
                            ? <CourseGradesTab selectedSection={selectedSection} />
                            : (!isStudent() && tabSelected == 4
                                ? (<AssignmentSubmissionsTab
                                    selectedSection={selectedSection}
                                    contentStack={contentStack}
                                    setContentStack={setContentStack}
                                    popContent={popContent}
                                />)
                                : (tabSelected == 5
                                    ? (<CourseAssignmentTab
                                        selectedSection={selectedSection}
                                    />)
                                    : (""))))
                )
            }
        </div>
    )
}

export default CourseContentPage;