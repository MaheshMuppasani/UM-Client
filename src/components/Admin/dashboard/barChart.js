import React, { useEffect, useRef, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    BarElement,
    scales
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import axiosInstance from '../../../axiosInstance';
import { capitalizeFirstLetter } from '../../Student/studentEnrollment';
import { URLS } from '../../../assets/urlConstants';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    scales
)

export const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(201, 203, 207, 0.8)'
]

export const borderColor = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)'
]

export const barTitlePlugin = [{
    id: 'displayValues',
    afterDatasetsDraw: (chart) => {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.font = '12px Arial';
                ctx.fillStyle = 'black'; // Adjust color if needed
                ctx.fillText(value, bar.x, bar.y + 2);
                ctx.restore();
            });
        });
    },
}];

export const barChartScales = {
    x: {
        ticks: {
            maxRotation: 15, // Adjust this to rotate the labels less steeply
            minRotation: 0,  // Minimum rotation
            callback: function (value) {
                const label = this.getLabelForValue(value);
                return label.length > 15 ? label.slice(0, 15) + '...' : label; // Truncate long labels
            },
        },
    },
}

const options = {
    plugins: {
        title: {
            display: true,
            text: 'Students Having Course Enrollments By Semester',
            position: 'bottom'
        },
        legend: {
            display: false
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

const BarChart = () => {

    const [barData, setBarData] = useState({
        labels: [],
        datasets: []
    })
    const [reportData, setReportData] = useState(null);
    const [semesterLimit, setSemesterLimit] = useState(10)
    const chartRef = useRef(null);

    const toggleLimit = () => setSemesterLimit((prevLimit) => prevLimit === 5 ? 10 : 5)

    const handleDownloadReport = (e) => {
        e.stopPropagation();

        const data = reportData;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollments");

        XLSX.writeFile(workbook, "SemesterEnrollments.xlsx");
    }

    useEffect(() => {
        let url = URLS.totalStudentsEnrolledPerSemester
        const params = {
            semesterLimit
        }
        axiosInstance.get(url, { params }).then((res) => {
            let data = res.data || [];
            const labels = data.map(sem => capitalizeFirstLetter(sem.semester_name))
            const dataset = [{
                label: "Total Students",
                data: data.map(sem => sem.total_students),
                backgroundColor: colors.slice(0, data.length),
                borderColor: borderColor.slice(0, data.length),
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
            }];
            setBarData({
                labels,
                datasets: dataset
            })
            setReportData(data)
        })
    }, [semesterLimit])

    return <div className='h-100'>
        <div className='d-flex justify-content-between'>
            <button className='btn btn-sm text-primary mx-2' onClick={toggleLimit}>Last {semesterLimit === 5 ? 10 : 5} semester</button>
            <div>
                <button className='btn btn-sm text-primary text-decoration-underline' onClick={handleDownloadReport}>Download Report</button>
            </div>
        </div>
        <Bar id="myBarChart" options={options} data={barData} plugins={barTitlePlugin} />
    </div>;
};

export default BarChart;
