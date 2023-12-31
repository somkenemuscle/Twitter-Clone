'use client'
import './signup.css'
import Footer from '@/components/fixed-footer'
import axios from "axios";
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useTweetContext } from "../context/TweetContext";
import { useUserContext } from '../context/userLog';


function signUp() {
    // for changing routes
    const router = useRouter();

    //global state to check if user is logged in or not
    const { isLoggedIn, setIsLoggedIn } = useUserContext();
    // State for global state flash message
    const { tweetMessage, setTweetMessage } = useTweetContext();

    //state for tweets
    const [user, setUser] = useState({
        name: '',
        username: '',
        email: '',
        password: ''

    })

    //form bootsrap validation state
    const [validated, setValidated] = useState(false);

    //handling input change and updating user state
    function handleChange(e) {
        const { value, name } = e.target;
        setUser((prevUser) => {
            return {
                ...prevUser,
                [name]: value
            }
        })
    }

    //add new user to database function
    async function registerUser(user) {
        try {
            const response = await axios.post("http://localhost:4000/api/tweets/signup", {
                username: user.username,
                name: user.name,
                email: user.email,
                password: user.password
            });
            // Destructuring message and token from response.data
            const { message, token } = response.data;
            if (response.status === 201) {
                //set isloggedin global state to true so logout will show on navbar
                setIsLoggedIn(true);
                // Handle successful signup
                setTweetMessage(message);
                // Store the token securely in localStorage
                localStorage.setItem('token', token);
                // Redirect to tweets page after successful signup
                router.push('/tweets');
            } else {
                // Handle error case (user already exists or other errors)
                setTweetMessage(message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    //handling submit when form is filled with (Bootstrap form validation)
    async function handlesubmit(e) {
        e.preventDefault(); // Prevent default form submission

        const form = e.currentTarget;
        if (!form.checkValidity()) {
            e.stopPropagation();
            setValidated(true);
            return; // Exit early if the form is not valid
        }

        try {
            // Attempt to add new user to the database
            await registerUser(user);
        } catch (error) {
            console.error('Error signing up:', error);
            // Handle error (e.g., show an error message to the user)
        }
    }


    return (
        <div>
            <div className='new-tweet-container'>
                <form className={validated ? 'was-validated' : ''} noValidate onSubmit={handlesubmit}>
                    <div className="row">
                        <div className="col-lg-6 col-md-12">
                            <input onChange={handleChange} type="text" value={user.username} className="tweet-input form-control" placeholder="Username" required name='username' />
                            <div className="invalid-feedback">
                                Please provide a username
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12">
                            <input onChange={handleChange} type="text" value={user.name} className="tweet-input form-control" placeholder="name" required name='name' />
                            <div className="invalid-feedback">
                                Please provide a name
                            </div>
                        </div>

                        <div className="col-lg-12 col-md-12">
                            <input onChange={handleChange} type="email" value={user.email} className="tweet-input form-control" placeholder="Email" required name='email' />
                            <div className="invalid-feedback">
                                Please provide a valid email
                            </div>
                        </div>

                        <div className="col-lg-12 col-md-12">
                            <input onChange={handleChange} type="password" value={user.password} className="tweet-input form-control" placeholder="Password" required name='password' />
                            <div className="invalid-feedback">
                                Please provide a password
                            </div>
                        </div>
                    </div>
                    <button className='btn btn-sm btn-dark'>Sign Up</button>
                </form>
                <Footer />
            </div>
        </div>
    )
}

export default signUp