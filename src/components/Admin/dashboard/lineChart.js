import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, scales } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../../../axiosInstance';
import { borderColor, colors } from './barChart';
import { URLS } from '../../../assets/urlConstants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  scales
)

const LineChart = () => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Percentage Of Students Completing Courses Over Time',
        position: 'bottom'
      },
    },
    scales: {
      y: {
        min: 0, // Start y-scale from 0
        max: 110, // Set y-scale max to 100
        ticks: {
          stepSize: 20, // Optional: Adjust tick intervals
          callback: (value) => value===110 ? `` : `${value}%`, // Optional: Add '%' to y-axis labels
        },
        title: {
          display: false,
          text: 'Percentage',
        },
      },
      x: {
        title: {
          display: false,
          text: 'Semester',
        },
      },
    },
    layout: {
      padding: {
          top: 10,
          bottom: 10,
      },
  },
  }

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  })

  useEffect(() => {
    const url = URLS.studentPassPercentageForCourses
    axiosInstance.get(url).then(res => {
      // console.log(res.data);
      const data = res.data || [];
      const xAxis = [...new Set(data.map(item => item.semester_name))]
      const yAxis = [...new Set(data.map(item => item.course_name))]
      const dataSets = yAxis.map((courseName, i) => {
        return {
          label: courseName,
          data: xAxis.map(semester => {
            return data.find(item => item.course_name === courseName && item.semester_name === semester)?.pass_percentage || null
          }),
          backgroundColor: colors[i],
          borderColor: borderColor[i],
          tension: 0.1
        }
      })
      setLineData({
        labels: xAxis,
        datasets: dataSets
      })
    })
  }, [])

  return <Line options={options} data={lineData} className='p-3' />
};

export default LineChart;