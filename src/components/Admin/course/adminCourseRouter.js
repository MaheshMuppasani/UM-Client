import { Switch, Route, useRouteMatch, useLocation, matchPath, Link } from "react-router-dom";
import AdminCoursePage from "./adminCoursePage";
import AdminCourseDetailsPage from "./adminCourseDetailsPage";

const breadcrumbConfig = {
    '/courses': 'Courses',
    '/courses/:courseId': 'Course Details',
    '/courses/:courseId/edit': 'Edit Course',
};

export const Breadcrumbs = ({ config }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const generateBreadcrumbs = () => {
        let path = '';
        return pathnames.map((_, index) => {
            const isLast = index === pathnames.length - 1;
            path += `/${pathnames[index]}`;
            const matchedKey = Object.keys(config).find((key) =>
                matchPath(path, { path: key, exact: true })
            );
            return matchedKey ? (
                <span key={path}>
                    {index > 0 && ' / '}
                    {
                        isLast ? (
                            <span style={{ fontWeight: 'bold' }}>{config[matchedKey]}</span>
                        ) : (<Link to={path}>{config[matchedKey]}</Link>)
                    }
                </span>
            ) : null;
        });
    };

    return <nav>{generateBreadcrumbs()}</nav>;
};

const AdminCourseRouter = (props) => {
    const { path } = useRouteMatch();
    return (
        <div>
            {/* <Breadcrumbs config={breadcrumbConfig} /> */}
            <Switch>
                <Route path={path} exact>
                    <AdminCoursePage />
                </Route>
                <Route path={`${path}/:courseId`}>
                    <AdminCourseDetailsPage />
                </Route>
            </Switch>
        </div>
    );
}

export default AdminCourseRouter;