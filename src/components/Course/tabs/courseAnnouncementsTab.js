import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useToast } from "../../../AppToast";
import axiosInstance from "../../../axiosInstance";
import PostAnnouncement from "../../Announcement/postAnnouncement";
import RenderAnnouncements from "../../Announcement/announcements";
import { URLS } from "../../../assets/urlConstants";
import { useUserRole } from "../../../userRole";

const CourseAnnouncementTab = (props) => {
    const { selectedSection } = props;
    const { isStudent } = useUserRole();
    const [show, setShow] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const { addToast } = useToast();

    const handleShow = () => setShow(true);
    const handleCloseModal = () => {
        setShow(false)
    }

    const getAllSectionAnnouncements = () => {
        axiosInstance.get(`${URLS.getAllSectionAnnouncements}/${selectedSection.Section_ID}`)
            .then(res => {
                setAnnouncements(res.data);
            })
    }

    const handlePostAnnouncement = async (e, formData) => {
        e.stopPropagation();
        const { value, contentName } = formData;

        const data = {
            sectionID: selectedSection.Section_ID,
            announcementTitle: contentName,
            announcementContent: DOMPurify.sanitize(value)
        }
        let url = URLS.postAnnouncement;

        try {
            const res = await axiosInstance.post(url, data);
            addToast("Announcement posted successfully!", "success");
        }
        catch (err) {
            addToast(err.data, "danger");
            return;
        }

        getAllSectionAnnouncements();
        handleCloseModal();
    }

    useEffect(() => {
        getAllSectionAnnouncements();
    }, [selectedSection.Section_ID])

    return (
        <div className="maxHeight">
            <div className="fs-4 mt-2 mb-4 d-flex justify-content-between align-items-center">
                <div>Announcements</div>
                {
                    !isStudent() ? <div className=""><button onClick={handleShow} className="btn btn-primary btn-sm">New Announcement</button></div> : ("")
                }
            </div>
            {
                announcements.length ? <RenderAnnouncements announcements={announcements} /> : <div className="fw-lighter text-center">No Announcements yet!</div>
            }
            {
                show && (
                    <PostAnnouncement
                        show={show}
                        onHide={handleCloseModal}
                        handleCreateContent={handlePostAnnouncement}
                        content={null}
                    />
                )
            }
        </div>
    )
}

export default CourseAnnouncementTab;