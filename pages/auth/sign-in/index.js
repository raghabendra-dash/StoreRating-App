import FormMessage from "@/components/UI/FormComponents/FormMessage/FormMessage";
import FormPage from "@/components/UI/FormComponents/FormPage/FormPage";
import Form from "@/components/UI/FormComponents/Form/Form";
import InputContainer from "@/components/UI/FormComponents/InputContainer/InputContainer";
import Input from "@/components/UI/FormComponents/Input/Input";
import FormButton from "@/components/UI/FormComponents/FormButton/FormButton";
import { useState, useEffect } from "react";
import axios from "axios";
import toastMsg from "@/utils/DisplayToast";
import { useDispatch, useSelector } from "react-redux";
import { userDataActions } from "@/redux-store/userDataSlice";
import { useRouter } from "next/router";
import roles from "@/utils/roles";
import Head from "next/head";

const SignIn = () => {
  const { user } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user?.name) {
      router.replace(
        user.role === roles.ADMIN
          ? "/admin/dashboard"
          : user.role === roles.USER
          ? "/user/dashboard"
          : "/store-owner/dashboard"
      );
    }
  }, [user, router]);

  const changeHandler = (event, field) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validation = (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const { email, password } = formData;

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid Email");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password should have at least 8 characters");
      return;
    }

    requestSignIn();
  };

  const requestSignIn = async () => {
    const emailInput = document.getElementById("signin-email");
    const passwordInput = document.getElementById("signin-password");

    emailInput.disabled = true;
    passwordInput.disabled = true;

    try {
      const res = await axios.post("/api/signin", formData);
      const { message, userData, data } = res.data;

      if (message === "error") {
        toastMsg("error", data);
      } else {
        dispatch(userDataActions.saveUserData(userData));
        toastMsg("success", "Sign In Success !!");

        // Redirect based on role
        router.push(
          userData.role === roles.ADMIN
            ? "/admin/dashboard"
            : userData.role === roles.USER
            ? "/user/dashboard"
            : "/store-owner/dashboard"
        );
      }
    } catch (error) {
      toastMsg("error", "Something went wrong!");
    } finally {
      emailInput.disabled = false;
      passwordInput.disabled = false;
    }
  };

  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="min-h-[inherit] flex justify-center items-center">
        <FormPage>
          <FormMessage
            header="Sign in to your account"
            subtext="Or"
            routetext="register a new account"
            route="/auth/sign-up"
          />
          <Form submitFunction={validation}>
            <InputContainer>
              <Input
                id="signin-email"
                label="Email Address"
                type="text"
                errorMessage={emailError}
                value={formData.email}
                onChange={(e) => changeHandler(e, "email")}
              />
              <Input
                id="signin-password"
                label="Password"
                type="password"
                errorMessage={passwordError}
                value={formData.password}
                onChange={(e) => changeHandler(e, "password")}
              />
            </InputContainer>
            <FormButton type="submit" label="Sign In" />
          </Form>
        </FormPage>
      </div>
    </>
  );
};

export default SignIn;
