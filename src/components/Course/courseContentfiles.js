import { useEffect, useState } from "react";
import axiosInstance from "../../axiosInstance";
import { URLS } from "../../assets/urlConstants";

const RenderContentFiles = (props) => {
    const { content } = props;
    const [fileURL, setFileURL] = useState(null);

    useEffect(() => {
        if (!content.file_id) return;
        axiosInstance.get(`${URLS.getFile}/${content.file_id}`, {
            responseType: 'blob', // Ensures the response is treated as binary
        }).then(response => {
            setFileURL({
                url: window.URL.createObjectURL(new Blob([response.data])),
                fileName: response.headers['content-disposition']?.split('filename=')[1]
            })
        }).catch(err => console.log(err))
    }, [])

    return (
        <div>
            <div className="mb-2">
                <p className="mb-2 text-black-50 d-inline-block">Files Attached:</p>
                {
                    fileURL 
                    ? <a className="d-block course-file text-decoration-none" href={fileURL.url} download={fileURL.fileName} target="_blank">{fileURL.fileName}</a>
                    : <div className="fw-light fst-italic text-secondary d-inline-block mx-2">None</div>
                }
            </div>
        </div>
    )
}

export default RenderContentFiles;