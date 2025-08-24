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
  const { name, role } = user;

  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [emailerror, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (name) {
      router.replace(
        role == roles.ADMIN
          ? "/admin/dashboard"
          : role == roles.USER
          ? "/user/dashboard"
          : "/store-owner/dashboard"
      );
    }
  }, [name, role, router]);

  function changeHandler(event, name) {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validation(e) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const email = formData.email;
    const password = formData.password;

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid Email");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password should have at least 6 characters");
      return false;
    }
    
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validation(e)) return;
    
    setIsLoading(true);
    const emailInput = e.target["signin-email"];
    const passwordInput = e.target["signin-password"];
    
    emailInput.disabled = true;
    passwordInput.disabled = true;

    try {
      const res = await axios.post(`/api/auth/signin`, {
        email: formData.email,
        password: formData.password,
      });
      
      const { message, data, userData } = res.data;
      
      if (message === "error") {
        toastMsg("error", data);
      } else {
        dispatch(userDataActions.saveUserData({ ...userData, ...data }));
        toastMsg("success", "Sign In Success !!");
        
        router.push(
          userData.role == roles.ADMIN
            ? "/admin/dashboard"
            : userData.role == roles.USER
            ? "/user/dashboard"
            : "/store-owner/dashboard"
        );
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toastMsg("error", "An error occurred during sign in");
    } finally {
      emailInput.disabled = false;
      passwordInput.disabled = false;
      setIsLoading(false);
    }
  }

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
          <Form submitFunction={handleSubmit}>
            <InputContainer>
              <Input
                id="signin-email"
                label="Email Address"
                type="email"
                errorMessage={emailerror}
                value={formData.email}
                onChange={(e) => changeHandler(e, "email")}
                required
              />
              <Input
                id="signin-password"
                label="Password"
                type="password"
                errorMessage={passwordError}
                value={formData.password}
                onChange={(e) => changeHandler(e, "password")}
                required
              />
            </InputContainer>
            <FormButton 
              type="submit" 
              label={isLoading ? "Signing In..." : "Sign In"} 
              disabled={isLoading}
            />
          </Form>
        </FormPage>
      </div>
    </>
  );
};

export default SignIn;
