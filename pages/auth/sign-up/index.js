import FormMessage from "@/components/UI/FormComponents/FormMessage/FormMessage";
import FormPage from "@/components/UI/FormComponents/FormPage/FormPage";
import Form from "@/components/UI/FormComponents/Form/Form";
import InputContainer from "@/components/UI/FormComponents/InputContainer/InputContainer";
import Input from "@/components/UI/FormComponents/Input/Input";
import FormButton from "@/components/UI/FormComponents/FormButton/FormButton";
import { useState } from "react";
import axios from "axios";
import toastMsg from "@/utils/DisplayToast";
import roles from "@/utils/roles";
import { useRouter } from "next/router";
import Head from "next/head";

// Password validation returns boolean
function passwordValidation(value, setPasswordError) {
  if (value.length < 8) {
    setPasswordError("Password should be at least 8 characters");
    return false;
  }
  if (!/[0-9]/.test(value)) {
    setPasswordError("Password should include a number [0-9]");
    return false;
  }
  if (!/[a-z]/.test(value)) {
    setPasswordError("Password should include a lowercase letter");
    return false;
  }
  if (!/[A-Z]/.test(value)) {
    setPasswordError("Password should include an uppercase letter");
    return false;
  }
  if (!/\W/.test(value)) {
    setPasswordError("Password should include a special character");
    return false;
  }
  if (value.length > 16) {
    setPasswordError("Password should be ≤ 16 characters");
    return false;
  }
  setPasswordError("");
  return true;
}

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    address: "",
  });
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const changeHandler = (event, field) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validation = (e) => {
    e.preventDefault();
    setEmailError("");
    setNameError("");
    setAddressError("");
    setPasswordError("");

    const { email, password, name, address } = formData;

    // Basic validations
    if (name.length < 3 || name.length > 60) {
      setNameError("Name should be between 3 and 60 characters");
      return;
    }
    if (address.length < 10 || address.length > 400) {
      setAddressError("Address should be 10-400 characters");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Invalid email");
      return;
    }
    if (!passwordValidation(password, setPasswordError)) return;

    requestSignUp();
  };

  const requestSignUp = async () => {
    const inputs = [
      "signup-email",
      "signup-password",
      "signup-name",
      "signup-address",
    ].map((id) => document.getElementById(id));

    inputs.forEach((input) => (input.disabled = true));

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        address: formData.address.trim(),
        role: roles.USER,
      };

      const res = await axios.post("/api/signup", payload);
      const { message, data } = res.data;

      if (message === "error") {
        toastMsg("error", data);
      } else {
        toastMsg("success", "Account created successfully!");
        setFormData({ email: "", password: "", name: "", address: "" });
        router.replace("/auth/sign-in");
      }
    } catch (error) {
      toastMsg("error", "Something went wrong!");
    } finally {
      inputs.forEach((input) => (input.disabled = false));
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up</title>
      </Head>
      <div className="border min-h-[inherit] flex justify-center items-center">
        <FormPage>
          <FormMessage
            header="Create a new account"
            subtext="Or"
            routetext="login to your existing account"
            route="/auth/sign-in"
          />
          <Form submitFunction={validation}>
            <InputContainer>
              <Input
                id="signup-name"
                label="Name"
                type="text"
                errorMessage={nameError}
                value={formData.name}
                onChange={(e) => changeHandler(e, "name")}
              />
              <Input
                id="signup-email"
                label="Email Address"
                type="text"
                errorMessage={emailError}
                value={formData.email}
                onChange={(e) => changeHandler(e, "email")}
              />
              <Input
                id="signup-password"
                label="Password"
                type="password"
                errorMessage={passwordError}
                value={formData.password}
                onChange={(e) => changeHandler(e, "password")}
              />
              <Input
                label="Address"
                name="signup-address"
                id="signup-address"
                value={formData.address}
                onChange={(e) => changeHandler(e, "address")}
                as="textarea"
                errorMessage={addressError}
              />
            </InputContainer>
            <FormButton type="submit" label="Sign Up" />
          </Form>
        </FormPage>
      </div>
    </>
  );
};

export default SignUp;
