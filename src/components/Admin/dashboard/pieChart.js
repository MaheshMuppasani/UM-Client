import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import axiosInstance from '../../../axiosInstance';
import { borderColor, colors } from './barChart';
import { capitalizeFirstLetter } from '../../Student/studentEnrollment';
import { URLS } from '../../../assets/urlConstants';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
)

const PieChart = (props) => {
    const [pieData, setPieData] = useState({
        labels: [],
        datasets: []
    })

    useEffect(() => {
        const url = URLS.getStudentDistributionByProgram
        axiosInstance.get(url).then((res) => {
            
            const data = res.data || [];

            const topFive = data.slice(0, 5);

            const others = data.slice(5);
            const othersTotal = others.reduce((acc, curr) => acc + curr.total_students, 0);

            // Prepare labels and data
            const labels = [
                ...topFive.map(p => capitalizeFirstLetter(p.program_name)),
                ...(others.length > 0 ? ["Others"] : [])
            ];

            const dataPoints = [
                ...topFive.map(p => p.total_students),
                ...(others.length > 0 ? [othersTotal] : [])
            ];

            // const labels = data.map(p => capitalizeFirstLetter(p.program_name))
            const dataset = [{
                label: "Total Strength",
                data: dataPoints,
                backgroundColor: colors.slice(0, dataPoints.length),
                borderColor: 'white',
                hoverOffset: 25
            }];
            setPieData({
                labels,
                datasets: dataset
            })
        })
    }, [])

    const options = {
        plugins: {
            title: {
              display: true,
              text: 'Pie Chart Showing Student Strength By Programs',
              position: 'bottom'
            },
            legend: {
                display: true,
                position: 'top', // Position the legend below the chart
                labels: {
                    boxWidth: 8, // Size of the color box
                    padding: 4,  // Spacing between legend items
                    boxHeight: 8
                },
            },
          },
          layout: {
            padding: {
                top: 10,
                // bottom: 10,
                // left: 10
            },
        },
    }

    const plugins = [{
        id: 'showValues',
        beforeDraw: (chart) => {
            const legendVisibility = chart.legend.legendItems.map(item => !item.hidden);
            const { ctx, chartArea: { width, height } } = chart;
            chart?.data.datasets[0]?.data.forEach((value, index) => {
                const meta = chart.getDatasetMeta(0)?.data[index];

                if (!legendVisibility[index] || !meta) return;

                const { x, y } = meta.tooltipPosition();
                // Draw value
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText(value, x, y);
                ctx.restore();
            });
        }
    }];

    return ( <Doughnut options={options} data={pieData} plugins={plugins}/> );
}
 
export default PieChart;