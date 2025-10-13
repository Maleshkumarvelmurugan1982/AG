import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "./RegisterPage.css";
import Navbar from "../Navbar/Navbar";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    let url = "";

    switch (data.userRole) {
      case "Farmer":
        url = `${process.env.REACT_APP_API_URL}/farmer/register`;
        break;
      case "Seller":
        url = `${process.env.REACT_APP_API_URL}/seller/register`;
        break;
      case "Deliveryman":
        url = `${process.env.REACT_APP_API_URL}/deliveryman/register`;
        break;
      default:
        alert("Invalid role selected");
        return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const text = await response.text();
      const responseData = text ? JSON.parse(text) : {};

      if (response.ok) {
        alert("Registration Successful!");
        // Redirect to login page after registration
        navigate("/login");
      } else {
        alert(responseData.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed. Please check your connection or try later.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-inner-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Sign Up</h3>

            <div className="select-role">
              <label>Role</label>
              <select {...register("userRole", { required: true })} required>
                <option value="">Select Role</option>
                <option value="Farmer">Farmer</option>
                <option value="Seller">Seller</option>
                <option value="Deliveryman">Deliveryman</option>
              </select>
              {errors.userRole && <span className="error">Role is required</span>}
            </div>

            <div className="first-name">
              <label>First name</label>
              <input
                type="text"
                placeholder="First name"
                {...register("fname", { required: true })}
              />
              {errors.fname && <span className="error">First name is required</span>}
            </div>

            <div className="last-name">
              <label>Last name</label>
              <input
                type="text"
                placeholder="Last name"
                {...register("lname", { required: true })}
              />
              {errors.lname && <span className="error">Last name is required</span>}
            </div>

            <div className="email">
              <label>Email address</label>
              <input
                type="email"
                placeholder="Enter email"
                {...register("email", { required: true })}
              />
              {errors.email && <span className="error">Email is required</span>}
            </div>

            <div className="password">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                {...register("password", { required: true, minLength: 6 })}
              />
              {errors.password && (
                <span className="error">
                  Password is required and must be at least 6 characters
                </span>
              )}
            </div>

            <div className="district">
              <label>District</label>
              <select {...register("district", { required: true })}>
                <option value="">Select District</option>
                <option value="virudhunagar">Virudhunagar</option>
                <option value="coimbatore">Coimbatore</option>
                <option value="madurai">Madurai</option>
                <option value="chennai">Chennai</option>
              </select>
              {errors.district && <span className="error">District is required</span>}
            </div>

            <div className="sign-up">
              <button type="submit" className="sign-up-button">
                Sign Up
              </button>
            </div>

            <div className="back-home">
              <Link to="/">
                <button type="button" className="back-home-button">
                  Back to Home
                </button>
              </Link>
            </div>

            <p className="forgot-password text-right">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>

        <div className="signup-image">
          <img
            src="https://assets-global.website-files.com/5d2fb52b76aabef62647ed9a/6195c8e178a99295d45307cb_allgreen1000-550.jpg"
            alt="Sign Up"
            className="img-signup"
          />
        </div>
      </div>
    </div>
  );
}
