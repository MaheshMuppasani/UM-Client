import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, scales } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../../../axiosInstance';
import { borderColor, colors } from './barChart';
import { URLS } from '../../../assets/urlConstants';
import CustomDropDown from '../course/customCourseDropDown';
import { useConstants } from '../../../constantsProvider';
import { SettingsIcon } from '../../../assets/constants';

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

const DEFAULT_DEMO_COURSES = [1, 2, 21, 22, 23];

const LineChart = (props) => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Percentage Of Students Passing Courses Over Time (Last 10 Semesters)',
        position: 'bottom'
      },
    },
    scales: {
      y: {
        min: 0,
        max: 110,
        ticks: {
          stepSize: 20,
          callback: (value) => value===110 ? `` : `${value}%`,
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
  const [courseChoiceList, setCourseChoiceList] = useState(props?.courses || []);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [xAxis, setXAxis] = useState([]);
  const { constants } = useConstants();
  const { semesters } = constants;

  const updateSelection = (e, course = null) => {
      let courseId = e.target.getAttribute('value') || course?.Course_ID;
      if (!courseId) return;
      courseId = Number(courseId);

      let temp = [...selectedCourses];
      if (temp.find(sc => sc.Course_ID === courseId)) {
          temp = temp.filter(v => v.Course_ID !== courseId)
      } else {
          const selectedCourse = courseChoiceList.find(p => p.Course_ID === courseId);
          if (selectedCourse && selectedCourse.Course_ID) {
              temp.push({
                  Course_ID: selectedCourse.Course_ID,
                  Course_Name: selectedCourse.Course_Name,
                  course_code: selectedCourse.course_code
              });
          }
      }
      setSelectedCourses(temp)
  }

  const updateSelectionOnBlur = (selectedOptions = []) => {
    setSelectedCourses(selectedOptions)
  }

  useEffect(() => {
    const params = {};
    if(selectedCourses.length){
      params.courses = JSON.stringify(selectedCourses.map(c => c.Course_ID))
    } else{
      return setLineData({...lineData, datasets: []})
    }
    axiosInstance.get(URLS.studentPassPercentageForCourses, { params } ).then(res => {
      const data = res.data || [];
  
      const courses = {};
      data.forEach(item => {
        if (!courses[item.course_code]) courses[item.course_code] = {};
        courses[item.course_code][item.semester_name] = item.pass_percentage;
      });
  
      const datasets = Object.keys(courses).map((course, i) => ({
        label: course,
        data: xAxis.map(semester => courses[course][semester] || null),
        borderColor: colors[i],
        backgroundColor: colors[i],
        tension: 0.1,
        fill: false,
      }));
  
      setLineData({
        labels: xAxis,
        datasets
      });
    });
  }, [selectedCourses, xAxis]);

  useEffect(() => {
    let url = URLS.getAllCourses;
    let params = {};
    axiosInstance.get(url, { params }).then((res) => {
      setCourseChoiceList(res.data);
      setSelectedCourses(res.data.filter(c => DEFAULT_DEMO_COURSES.includes(c.Course_ID)))
    })
  }, [])

  useEffect(() => {
    if(!semesters) return;
    let sems = [], i = 0;
    while(!semesters[i].is_current_semester){
      sems.push(`${semesters[i].semester_term} ${semesters[i].semester_year}`)
      i++;
    }
    setXAxis(sems.slice(sems.length - 10, sems.length)); // set timeline to last 10 semesters
  }, [semesters])

  return <div className='h-100'>
    <div style={{position: 'absolute'}} className='customDropDown'>
      <CustomDropDown
        className={`form-control coursesearchDropDown`}
        displayTitle={<SettingsIcon />}
        options={courseChoiceList}
        selectedOptions={selectedCourses}
        onBlur={updateSelectionOnBlur}
        autoClose="outside"
        displaySelected={true}
        maxSelect={5}
      />
    </div>
    <Line options={options} data={lineData} />
  </div>
};

export default LineChart;