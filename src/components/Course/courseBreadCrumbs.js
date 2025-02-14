const CourseBreadCrumbs = (props) => {
    const { contentStack, handleGoToFolder, selectedSection } = props;
    return (
        <div className="fw-normal fs-6 d-flex gap-2 flex-wrap">
            {
                <div className={`${contentStack.length ? 'cursor-pointer text-primary' : ''}`} onClick={e => handleGoToFolder(e, -1)}>{">>"} {selectedSection.course_code} {selectedSection.Course_Name} [CR {selectedSection.CreditHours}] (Section: {selectedSection.Section_ID})</div>
            }
            {
                contentStack.map((content, i) => {
                    const { content_id, content_name } = content;
                    let className = '';
                    if (i !== (contentStack.length - 1)) {
                        className = className + 'cursor-pointer text-primary';
                    }
                    const handleClick = (e) => {
                        e.stopPropagation();
                        if (i !== (contentStack.length - 1)) {
                            handleGoToFolder(i);
                        }
                    }
                    return <div className={`${className}`} key={content_id} onClick={handleClick}>{">>"} {content_name}</div>
                })
            }
        </div>
    )
}

export default CourseBreadCrumbs;