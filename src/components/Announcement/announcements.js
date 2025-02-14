import DOMPurify from "dompurify";
import { formatDate } from "../../utils/utils";


const RenderAnnouncements = (props) => {
    const { announcements } = props;
    return (
        <div className="maxHeight">
            {
                announcements.map(announcement => {
                    const { announcementID, sectionID, postedON, postedBy, announcementTitle, announcementContent, FacultyName } = announcement;
                    const sanitizedHtml = DOMPurify.sanitize(announcementContent);
                    return <div className="px-5 py-3 border border-secondary-subtle" key={announcementID}>
                        <div className="courseContentHeader">
                            <div className={`mb-1 d-flex gap-5 flex-grow-1 justify-content-between`}>
                                <h4 className={`heading`}>{announcementTitle}</h4>
                            </div>
                            <p className="fst-italic m-0" style={{fontSize: '0.8rem'}}><span className="text-black-50">Posted on: </span>{formatDate(postedON)}</p>
                            <p className="fst-italic" style={{fontSize: '0.8rem'}}><span className="text-black-50">Posted by: </span>{FacultyName.split(" ").join(", ")}</p>
                        </div>
                        <div className="body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                    </div>
                })
            }
        </div>
    )
}

export default RenderAnnouncements;