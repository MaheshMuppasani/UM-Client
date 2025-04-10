import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
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
        &#x25bc;
    </a>
));

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
export const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
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
                    value={value}
                />
                <ul className="list-unstyled">
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value || child.props.children.join('').toLowerCase().includes(value.toLowerCase()),
                    )}
                </ul>
            </div>
        );
    },
);

const CustomDropDown = (props) => {
    const { displayTitle, options = [], onSelectCallback, selectedOptions = [], ...forwardProps } = props;
    return (
        <Dropdown onClick={onSelectCallback} {...forwardProps}>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                { displayTitle || "Choose an option" }
            </Dropdown.Toggle>

            <Dropdown.Menu as={CustomMenu}>
                {
                    options.map(o => <Dropdown.Item key={o.Course_ID} value={o.Course_ID} active={selectedOptions.find(v => v.Course_ID===o.Course_ID) ? true : false}>{o.course_code} {o.Course_Name}</Dropdown.Item>)
                }
                {/* <Dropdown.Item value={1}>Red</Dropdown.Item>
                <Dropdown.Item value={2}>Blue</Dropdown.Item>
                <Dropdown.Item value={3} active>
                    Orange
                </Dropdown.Item>
                <Dropdown.Item value={4}>Red-Orange</Dropdown.Item> */}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default CustomDropDown;