import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axiosInstance from '../../../../axiosInstance';
import { capitalizeFirstLetter } from '../../../Student/studentEnrollment';
import { barChartScales, barTitlePlugin, borderColor, colors } from '../barChart';
import { URLS } from '../../../../assets/urlConstants';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
)

const options = {
    plugins: {
        title: {
            display: true,
            text: 'Bar Chart Showing Most Enrolled Courses By Semester (Current Semester)',
            position: 'bottom'
        },
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                // Custom tooltip content
                title: function (context) {
                    const index = context[0].dataIndex;
                    const dataset = context[0].dataset;

                    return dataset.fullLabels[index];
                }
            }
        }
    },
    layout: {
        padding: {
            top: 10,
            bottom: 10,
        },
    },
    scales: { ...barChartScales },
    responsive: true,
}

const CourseEnrollmentsBarChart = () => {
    const [barData, setBarData] = useState({
        labels: [],
        datasets: []
    })

    const [courseLimit, setcourseLimit] = useState(10)

    const toggleLimit = () => setcourseLimit((prevLimit) => prevLimit === 5 ? 10 : 5)

    useEffect(() => {
        let url = URLS.courseEnrollmentsBySemester
        const params = {
            courseLimit
        }
        axiosInstance.get(url, { params }).then((res) => {
            const data = res.data || [];
            const labels = data.map(c => capitalizeFirstLetter(c.course_code))
            const dataset = [{
                label: "Total Students Enrolled",
                data: data.map(c => c.total_enrollments),
                backgroundColor: colors.slice(0, data.length),
                borderColor: borderColor.slice(0, data.length),
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
                fullLabels: data.map(c => `${c.course_code} ${c.course_name}`),
            }];
            setBarData({
                labels,
                datasets: dataset
            })
        })
    }, [courseLimit])

    return <div className='h-100'>
        <button className='btn btn-sm text-primary mx-2' onClick={toggleLimit}>Top {courseLimit === 5 ? 10 : 5} Courses</button>
        <Bar options={options} data={barData} plugins={barTitlePlugin} />
    </div>
};

export default CourseEnrollmentsBarChart;
