import { FC, Fragment } from "react";
interface FormErrorMessageProps {
    error: any;
    touched?: boolean | undefined;
}
const FormErrorMessage: FC<FormErrorMessageProps> = ({ error, touched }) => {
    return (
        <Fragment>
            {error?.type === "required" && (
                <span className="text-red-500 text-sm">This field is required</span>
            )}
            {error?.type === "minLength" && (
                <span className="text-red-500 text-sm">{error.message}</span>
            )}
            {error?.type === "min" && (
                <span className="text-red-500 text-sm">{error.message}</span>
            )}
            {(error?.type === "pattern" ||
                error?.type === "validate" ||
                error?.type === "hasSpecialChar" ||
                error?.type === "hasNumber" ||
                error?.type === "hasLowerCase" ||
                error?.type === "hasUpperCase") && (
                    <span className="text-red-500 text-sm">{error.message}</span>
                )}
        </Fragment>
    );
};
export default FormErrorMessage;
