import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { LoginAPI } from "../../api";
import { LoginError } from "../../utils/validation";

const Login = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = ChatState();
    const navigate = useNavigate();

    const submitHandler = async () => {
        setLoading(true);
        const check = await LoginError({ email, password });
        if (check.isError) {
            toast({
                title: check.msg,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        const data = await LoginAPI({ email, password });
        if (!data.isError) {
            toast({
                title: "Login Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            setLoading(false);
            navigate('/chats');
        } else if (data.isError) {
            setLoading(false);
            toast({
                title: data.msg,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } else {
            setLoading(false);
            toast({
                title: "Some Error Ocuured",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
    };

    return (
        <VStack spacing="10px">
            <FormControl id="login-email" isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                    value={email}
                    type="email"
                    placeholder="Enter Your Email Address"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id="login-password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={show ? "text" : "password"}
                        placeholder="Enter password"
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>
            <Button
                variant="solid"
                colorScheme="red"
                width="100%"
                onClick={() => {
                    navigate('/guest')
                }}
            >
                Guest Mode
            </Button>
        </VStack>
    );
};

export default Login;