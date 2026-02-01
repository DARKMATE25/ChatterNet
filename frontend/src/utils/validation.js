const isEmailValid = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const SignUpError = async (InitialValues) => {
    let { name, email, password, confirmpassword } = InitialValues;
    name = name.trim();
    password = password.trim();
    confirmpassword = confirmpassword.trim();
    email = email.trim();


    if (!email || !name || !password || !confirmpassword) {
        return { msg: "Please fill all the details.", isError: true };
    } else if (!isEmailValid(email)) {
        return { msg: "Invalid email format", isError: true };
    } else if (password !== confirmpassword) {
        return { msg: "Password doesn't Matched", isError: true };
    } else if (name.length < 6) {
        return { msg: "name must be at least 6 characters", isError: true };
    } else if (password.length < 6) {
        return { msg: "Password must be at least 6 characters", isError: true };
    } else {
        return { msg: "All checked", isError: false };
    }
};


export const LoginError = async ({ email, password }) => {
    password = password.trim();
    email = email.trim();

    if (!email || !password) {
        return { msg: "Please fill all the details.", isError: true };
    } else if (!isEmailValid(email)) {
        return { msg: "Invalid email format", isError: true };
    } else {
        return { msg: "All checked", isError: false };
    }
};