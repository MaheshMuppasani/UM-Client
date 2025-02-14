import { Switch, Route, useRouteMatch, useLocation, matchPath, Link } from "react-router-dom";
import AdminFacultyPage from "./admin.faculty.defaultPage";


const AdminFacultyRouter = (props) => {
    const { path } = useRouteMatch();
    return (
        <div>
            {/* <Breadcrumbs config={breadcrumbConfig} /> */}
            <Switch>
                <Route path={path} exact>
                    <AdminFacultyPage />
                </Route>
            </Switch>
        </div>
    );
}

export default AdminFacultyRouter;