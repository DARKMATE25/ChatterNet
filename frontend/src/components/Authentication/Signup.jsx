import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpError } from "../../utils/validation";
import { SignUp } from "../../api";
import { ChatState } from "../../Context/ChatProvider";

const InitialValues = {
    name: '',
    email: "",
    password: "",
    confirmpassword: "",
    pic: "",
}
const Signup = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const navigate = useNavigate();
    const [pic, setPic] = useState();
    const [picLoading, setPicLoading] = useState(false);
    const [signupValues, setSignUp] = useState(InitialValues);
    const { setUser, user } = ChatState();
    const onValuechange = (e) => {
        setSignUp({ ...signupValues, [e.target.name]: e.target.value });
    }


    const submitHandler = async (e) => {
        e.preventDefault();
        const check = await SignUpError(signupValues);
        if (check.isError) {
            toast({
                title: check.msg,
                status: "error",
                duration: 3000,
                position: "top",
            });
            return;
        }
        const data  = await SignUp(signupValues);
        if (!data.isError) {
            toast({
                title: "SignUp Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            navigate('/chats');
        } else if (data.isError) {
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } else {
            toast({
                title: "Some Error Ocuured",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const postDetails = (pics) => {
        setPicLoading(true);
        if (pics === undefined) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chatApp");
            data.append("cloud_name", "aakash900");
            fetch("https://api.cloudinary.com/v1_1/aakash900/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    setPicLoading(false);
                })
                .catch((err) => {
                    setPicLoading(false);
                });
        } else {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setPicLoading(false);
            return;
        }
    };

    return (
        <VStack spacing="5px">
            <FormControl id="signup-name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    name="name"
                    placeholder="Enter Your Name"
                    value={signupValues.name}
                    onChange={(e) => onValuechange(e)}
                />
            </FormControl>
            <FormControl id="signup-email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                    name="email"
                    type="email"
                    value={signupValues.email}
                    placeholder="Enter Your Email Address"
                    onChange={(e) => onValuechange(e)}
                />
            </FormControl>
            <FormControl id="signup-password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="Enter Password"
                        name="password"
                        value={signupValues.password}
                        onChange={(e) => onValuechange(e)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="signup-confirm-password" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        name="confirmpassword"
                        type={show ? "text" : "password"}
                        placeholder="Confirm password"
                        value={signupValues.confirmpassword}
                        onChange={(e) => onValuechange(e)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id="pic">
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>
            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={picLoading}
            >
                Sign Up
            </Button>
        </VStack>
    );
};

export default Signup;