import React, { memo, useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import { MultiSelectedOptions } from './AddCourseModal';

export const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {children}
    </a>
));

export const CustomMenu = React.forwardRef(
    (props, ref) => {
        const { children, style, className, 'aria-labelledby': labeledBy, bottomContent } = props;
        const [value, setValue] = useState('');
        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
            >
                <Form.Control
                    autoFocus
                    className="mx-3 my-2 w-auto"
                    placeholder="Type to filter..."
                    onChange={(e) => setValue(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    value={value}
                />
                <ul className="list-unstyled">
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value || child.props.textContent.toLowerCase().includes(value.toLowerCase()),
                    )}
                </ul>
                {bottomContent}
            </div>
        );
    },
);

const MemoizedDropdownItem = memo(({
    course,
    isSelected,
    isDisabled,
    handleSelect
}) => {
    return (
        <Dropdown.Item
            as={"div"}
            key={course.Course_ID}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
                e.preventDefault();
                handleSelect(e, course);
            }}
            value={course.Course_ID}
            disabled={isDisabled}
        >
            <div style={{ position: 'relative', display: 'flex' }}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    className='me-2'
                    disabled={isDisabled}
                    readOnly={true}
                />{" "}
                <span>{course.course_code} {course.Course_Name}</span>
                <div
                    style={{ position: 'absolute', width: '100%', height: '100%', zIndex: '100', top: 0, left: 0 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(e, course);
                    }}
                ></div>
            </div>
        </Dropdown.Item>
    );
});

const CustomDropDown = (props) => {
    const { displayTitle,
        options = [],
        onSelect,
        onBlur,
        selectedOptions = [],
        maxSelect = null,
        ...forwardProps } = props;

    const [localSelected, setLocalSelected] = useState(selectedOptions);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setLocalSelected(selectedOptions)
    }, [selectedOptions])

    const handleSelect = (e, course) => {
        e.preventDefault();
        const courseId = course?.Course_ID;
        if (!courseId) return;

        setLocalSelected(prev => {
            const isSelected = prev.some(sc => sc.Course_ID === courseId);
            let newSelected;

            if (isSelected) {
                newSelected = prev.filter(v => v.Course_ID !== courseId);
            } else {
                if (maxSelect && prev.length >= maxSelect) return prev;
                const selectedCourse = options.find(p => p.Course_ID === courseId);
                if (selectedCourse) {
                    newSelected = [...prev, {
                        Course_ID: selectedCourse.Course_ID,
                        Course_Name: selectedCourse.Course_Name,
                        course_code: selectedCourse.course_code
                    }];
                }
            }

            if (onSelect && newSelected) {
                onSelect(e, course);
            }

            return newSelected || prev;
        });
    };

    const handleToggle = (isOpen) => {
        setIsMenuOpen(isOpen);
        if (!isOpen && onBlur) {
            onBlur(localSelected);
        }
    }

    const bottomContent = (
        <>
            {props.displaySelected &&
                (
                    <>
                        <div style={{ fontSize: '0.8rem' }} className='px-3'>Selected {localSelected.length} of {maxSelect}</div>
                        <MultiSelectedOptions
                            selectedOptions={localSelected}
                            textKey={'course_code'}
                            removeOption={handleSelect}
                            retainHeight={false}
                        />
                    </>
                )}
            {maxSelect && <div className='d-flex gap-1 px-3 text-secondary justify-content-end align-items-center py-1'>
                <button className='btn btn-sm btn-primary px-3' onClick={(e) => handleToggle(false)}>Apply</button>
            </div>}
        </>
    )
    return (
        <Dropdown
            {...forwardProps}
            onToggle={handleToggle}
            show={isMenuOpen}
            onClick={handleSelect}
        >
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                {displayTitle || "Choose an option"}
            </Dropdown.Toggle>
            <Dropdown.Menu
                as={CustomMenu}
                bottomContent={bottomContent}
                style={{ transition: 'none' }}
            >
                {
                    options.map(o => (
                        <MemoizedDropdownItem
                            key={o.Course_ID}
                            course={o}
                            isSelected={localSelected.some(v => v.Course_ID === o.Course_ID)}
                            isDisabled={maxSelect ? !localSelected.some(v => v.Course_ID === o.Course_ID) && (localSelected.length >= maxSelect) : false}
                            handleSelect={handleSelect}
                            textContent={`${o.course_code} ${o.Course_Name}`} // important, for searching purpose 
                        />))
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default CustomDropDown;