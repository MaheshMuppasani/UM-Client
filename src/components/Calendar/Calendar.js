import { useEffect } from "react";
import { URLS } from "../../assets/urlConstants";
import axiosInstance from "../../axiosInstance";

const calendarAppURL = "https://calendar-app-university.vercel.app"

const CalendarPage = (props) => {

    function sendMessageToCalendarApp(events, navDate) {
        const iframe = document.getElementById("calendar-app");
        if (iframe && iframe.contentWindow) {
          const message = {
            type: "EVENTS",
            payload: {
              events: events,
              navigatedDate: navDate
            },
          };
          iframe.contentWindow.postMessage(message, calendarAppURL);
        }
      }

      const getAllStudentExams = (navDate) => {
            const params = {
                dueMonth: navDate.month + 1,
                dueYear: navDate.year
            }
            const url = URLS.getAllStudentExamDeadlineInfo;
            axiosInstance.get(url, { params }).then((res) => {
                sendMessageToCalendarApp(res.data, navDate);
            })
      }

    useEffect(() => {
        const handleMessage = (event) => {
          if (event.origin !== calendarAppURL) return;
      
          const { type, payload } = event.data;
      
          if (type === "DATE_SELECTED") {
            getAllStudentExams(payload.selectedDate);
          }
        };
      
        window.addEventListener("message", handleMessage);
      
        return () => {
          window.removeEventListener("message", handleMessage);
        };
      }, []);

    return (
        <div className="calendar-container">
            <iframe width={"100%"} height={"100%"} id="calendar-app" src={calendarAppURL}></iframe>
        </div>
    );
}

export default CalendarPage;