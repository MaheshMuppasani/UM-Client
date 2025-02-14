import { Button, Modal } from "react-bootstrap";
import { ContentFileIcons, contentTypes } from "../../assets/constants";

const DeleteContentModal = (props) => {
    const { handleSubmit, content } = props;
    const { content_type = "", content_name, deletePrompt = "", modalTitle = "" } = content;

    const ContentIcon = ContentFileIcons[contentTypes.findIndex(ct => ct === content_type)];
    const contentType = content_type==="Exam" ? "Assignment" : content_type
    //  "Content";
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {
                        modalTitle ? modalTitle : (`Delete Course ${contentType}`)
                    }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="courseContentHeader d-flex gap-4">
                    {
                        ContentIcon ? <ContentIcon /> : ("")
                    }
                    <div className={`mb-4 d-flex gap-5 flex-grow-1 justify-content-between`}>
                        <h4 className={`${content_type === "folder" ? 'heading' : ''}`} >{content_name}</h4>
                    </div>
                </div>
                {
                    deletePrompt 
                    ? <p>{deletePrompt}</p>
                    : <p>Are you sure to delete this {contentType.toLowerCase()}? This course {contentType.toLowerCase()} and all the data associated with it will be deleted permanently!</p>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-danger" onClick={handleSubmit}>Delete {contentType}</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteContentModal;