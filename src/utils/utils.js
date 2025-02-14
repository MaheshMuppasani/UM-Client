export function formatDate(dateString) {
    // Parse the input date
    const date = new Date(dateString);

    // Get the formatted date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', // Full day name (e.g., Friday)
        year: 'numeric', // Full year (e.g., 2023)
        month: 'long',   // Full month name (e.g., December)
        day: 'numeric',  // Day of the month (e.g., 29)
        hour: 'numeric', // Hour (e.g., 2)
        minute: 'numeric', // Minutes (e.g., 47)
        second: 'numeric', // Seconds (e.g., 15)
        hour12: true,     // 12-hour clock with AM/PM
        timeZoneName: 'short' // Time zone abbreviation (e.g., EST)
    }).format(date);

    return formattedDate;
}

export function DateToDOBFormat(dateString) {
    const date = new Date(dateString);

// Format the date
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    })
    return formattedDate;
}

export function formatDateToLocaleString(dateString) {
    const date = new Date(dateString);
    const options = {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

export const fetchDueDateTime = (dateTime) => {

    // Parse the datetime
    const date = new Date(dateTime);

    // Format the date and time

    const formattedDate = () => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    // yyyy-mm-dd

    const formattedTime = () => `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`.split(':').map(p => p.toString().padStart(2, '0')).join(':');

    return { formattedDate, formattedTime }
};

export const dateFormat = (dateTime) => new Date(dateTime)

export function getColorForGrade(grade, maxScore) {
    // Ensure the grade is within 0-100 range
    const percentage = (grade / maxScore) * 100;

    // Ensure the percentage is within 0-100 range
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));

    // Calculate the red and green values (from red to green)
    const red = Math.round((100 - clampedPercentage) * 2.55); // Decrease as percentage increases
    const green = Math.round(clampedPercentage * 2.55);     // Increase as grade increases

    // Return the RGB color as a string
    return `rgba(${red * 1.5}, ${green * 1.7}, 0, 0.8)`;
}

// export function 