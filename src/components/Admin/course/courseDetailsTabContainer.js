import { useState } from "react";
import CourseTeachingsTab from "./courseTeachingsTab";

const CourseDetailsTabContainer = (props) => {
    const [tabSelected, setTabSelected] = useState(1);

    const handleTabClick = (e) => {
        e.stopPropagation();
        setTabSelected(e.target.value)
    }
    return (
        <div className="maxHeight">
            <div className="d-flex justify-content-between">
                <ul className="nav nav-tabs w-100">
                    <li className="nav-item">
                        <button
                            className={`w-100 nav-link text-center ${tabSelected == 0 ? 'active' : ''}`}
                            onClick={handleTabClick}
                            value={0}
                        >Course Details</button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`w-100 nav-link text-center ${tabSelected == 1 ? 'active' : ''}`}
                            onClick={handleTabClick}
                            value={1}
                        >Course Teachings</button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`w-100 nav-link text-center ${tabSelected == 2 ? 'active' : ''}`}
                            onClick={handleTabClick}
                            value={2}
                        >Manage Course Content</button>
                    </li>
                </ul>
            </div>
            {
                tabSelected == 1 && (
                    <CourseTeachingsTab />
                )
            }
        </div>
    );
}

export default CourseDetailsTabContainer;