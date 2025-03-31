import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "../../axiosInstance.js";
import { useToast } from "../../AppToast.js";
import { useUserRole } from "../../userRole.js";
import { URLS } from "../../assets/urlConstants.js";
import { feedBackType, localStoreProperties, ROUTES, SocialFB, SocialIG, SocialX, SocialYT, userFeedback } from "../../assets/constants.js";
import { useConstants } from "../../constantsProvider.js";

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email) => emailRegex.test(email);

const Login = (props) => {
    const history = useHistory();
    const { addToast, clearToast } = useToast();
    const { constants } = useConstants();
    const { setUserRole, userRole } = useUserRole();
    const [formState, setFormState] = useState({ email: "", pw: "", emailError: "", pwError: "" });
    const [toastID, setToastID] = useState(null);

    const updateEmail = (e) => {
        const tempForm = formState;
        setFormState({
            ...tempForm,
            email: e.target.value
        })
    }

    const updatePW = (e) => {
        const tempForm = formState;
        setFormState({
            ...tempForm,
            pw: e.target.value
        })
    }

    const validate = (formState) => {
        let validationError = false;
        if (!formState.email) {
            validationError = true;
            formState.emailError = userFeedback.emptyEmail
        } else if (!validateEmail(formState.email)) {
            validationError = true;
            formState.emailError = userFeedback.invalidEmail
        } else {
            formState.emailError = ""
        }

        if (!formState.pw) {
            validationError = true;
            formState.pwError = userFeedback.emptyPassword
        } else {
            formState.pwError = "";
        }
        return [formState, validationError];
    }

    const login = async (e) => {
        e.preventDefault();
        if(toastID){
            clearToast(toastID)
        }
        const [validatedForm, validationError] = validate({ ...formState });
        setFormState(validatedForm);
        if (validationError) {
            return;
        }
        const url = URLS.login;
        const form = {
            email: formState.email,
            pw: formState.pw
        };
        try {
            const response = await axios.post(url, form);
            const { accessToken, role } = response.data;
            localStorage.setItem(localStoreProperties.ACCESS_TOKEN, accessToken);
            localStorage.setItem(localStoreProperties.ROLE, role);
            setUserRole(role);
            addToast(userFeedback.loginSuccess, feedBackType.success, 2000)
            history.push(ROUTES.HOME);
        }
        catch (err) {
            const { loginFormFeedbackConstants = null } = constants;
            const data = err.data;
            setFormState((prevState) => {
                const tempForm = { ...prevState }

                switch (data?.type) {
                    case loginFormFeedbackConstants.EMAIL_NOT_FOUND: {
                        tempForm.emailError = loginFormFeedbackConstants.EMAIL_NOT_FOUND_MSG
                        break;
                    }
                    case loginFormFeedbackConstants.PASSWORD_ERR: {
                        tempForm.pwError = loginFormFeedbackConstants.PASSWORD_ERR_MSG
                        break;
                    }
                    default: break;
                }
                return tempForm
            })
        }
    }

    const forgotPassword = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = addToast(userFeedback.forgotPW, feedBackType.success, 5000, true, toastID)
        setToastID(id);
    }

    useEffect(() => {
        if (userRole) {
            history.push(ROUTES.HOME)
        }
    }, [])

    return (
        <div className="login-register d-flex flex-column justify-content-center">
            <div className="app-brand-container app-header py-3 px-4 d-flex justify-content-between align-items-center">
                <a href="/" className="text-decoration-none text-white d-flex flex-column align-items-center">
                <h2 className="m-0">Horizon University</h2>
                <p className="m-0" style={{fontSize: '0.85rem'}}>Empowering Minds, Shaping Futures</p>
                </a>
                
                <div className="d-flex gap-4 socialHandles px-3">
                    <a href="/" className="text-decoration-none text-white"><SocialFB /></a>
                    <a href="/" className="text-decoration-none text-white"><SocialX /></a>
                    <a href="/" className="text-decoration-none text-white"><SocialYT /></a>
                    <a href="/" className="text-decoration-none text-white"><SocialIG /></a>
                </div>
            </div>
            <div className='maxHeight d-flex align-items-center justify-content-center'>
                <div className='login-form p-4 rounded'>
                    <p className="text-body-secondary text-center mb-5"><h4>Login Page</h4></p>
                    <form>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">Email address<span className="text-danger">*</span></label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={updateEmail}
                                className={`form-control ${formState.emailError ? 'is-invalid' : ""}`}
                                id="exampleInputEmail1"
                                aria-describedby="emailHelp"
                            />
                            <div id="validationEmailFeedback" class={`${formState.emailError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.emailError
                                        ? formState.emailError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="exampleInputPassword1" class="form-label">Password<span className="text-danger">*</span></label>
                            <input
                                type="password"
                                value={formState.pw}
                                onChange={updatePW}
                                className={`form-control ${formState.pwError ? 'is-invalid' : ""}`}
                                id="exampleInputPassword1"
                            />
                            <div id="validationCredentialsFeedback" class={`${formState.pwError ? "invalid-feedback" : ""}`}>
                                {
                                    formState.pwError
                                        ? formState.pwError
                                        : <span aria-hidden="true" className="invisible">.</span>
                                }
                            </div>
                        </div>
                        <button type="submit" class="mb-3 px-4 submit btn btn-primary" onClick={login}>Login</button>
                        <div className="mb-2 text-end"><a href={ROUTES.REGISTER_STUDENT}>Click here to register now!</a></div>
                        <div className="mb-2 text-end"><a href={ROUTES.HOME} onClick={forgotPassword}>Forgot password?</a></div>
                    </form>
                </div>
            </div>
            <div className="text-center"><p><a href="/">Copyright</a> Horizon University. Mount Pleasant. MI 48858 | Phone: 989-491-1302</p></div>
        </div>
    )
}

export default Login;