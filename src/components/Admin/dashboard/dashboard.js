import BarChart from "./barChart";
import CourseEnrollmentsBarChart from "./courseAnalytics/courseEnrollmentsBarChart";
import LineChart from "./lineChart";
import PieChart from "./pieChart";

const AdminDashboard = (props) => {
    return (
        <div style={{overflow: "hidden"}}>
            <div className="d-flex flex-row h-50">
                <div className="w-50 ">
                    <LineChart />
                </div>
                <div className="flex-grow-1 w-50">
                    <BarChart />
                </div>
            </div>
            <div className="d-flex flex-row h-50">
                <div className="w-50">
                    <CourseEnrollmentsBarChart />
                </div>
                <div className="flex-grow-1 w-50 px-3">
                    <PieChart />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;