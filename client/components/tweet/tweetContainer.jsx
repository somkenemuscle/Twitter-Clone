import Image from "next/image";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faRetweet,
  faComment,
  faCircleCheck,
  faHeart,
  faHeartCircleMinus,

} from "@fortawesome/free-solid-svg-icons";
import '../tweet/tweet.css'
import { useState, useEffect } from "react";

export default function tweetContainer(props) {

  //state to keep track of showing all text
  const [showAll, setShowAll] = useState();
  const maxLength = 280; // Set your desired maximum word length

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  //handling routing
  const router = useRouter();

  //state for delete and current user info
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  //get token from local storage
  const token = localStorage.getItem('token');

  // Check if user is logged in
  useEffect(() => {
    setIsLoggedIn(!!token); // Set isLoggedIn based on token existence (true or false)
  }, [token]);

  // Fetch current user ID if logged in
  useEffect(() => {
    async function getCurrentUser() {
      try {
        if (token) {
          const headers = createAuthHeaders(token);
          //get currentuser id and save to state
          const response = await axios.get(`http://localhost:4000/api/user`, {
            headers: headers,
          });
          setCurrentUserId(response.data._id);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getCurrentUser();
  }, [token]);


  //delete function , to delete a specific tweet with the id provided
  async function handleDelete(id, author_id) {
    try {
      // Set the Authorization header with the JWT token
      const headers = createAuthHeaders(token);
      //check for authorization for deleting a post
      if (currentUserId === author_id) {
        // Make the DELETE request with the provided headers
        const response = await axios.delete(`http://localhost:4000/api/tweets/${id}`, {
          headers: headers,
        });
        router.push(`/tweets`);
      }
    } catch (error) {
      console.log(error)
    }
  }

  //for token headers
  function createAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  //handling redirect to a specific id ( id passed to the function from props.id)
  function handleRedirect(id) {
    router.push(`/tweets/${id}`);
  }

  //change the date format to yy/mm/dd
  const options = { month: 'short', day: '2-digit', year: 'numeric' };
  const formattedDate = new Date(props.time).toLocaleDateString('en-US', options);

  return (
    <div className="tweet-card" >
      <div >
        <div>
          <span> <FontAwesomeIcon icon={faHeartCircleMinus} style={{ fontSize: 15, color: "lightgreen" }} />  </span>
          <span className="card-title">{props.name}</span> <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 15, color: "#1DA1F2" }} /> <span className="subtitle">@{props.username}. {formattedDate}</span>
          <span className="delete-btn dropdown">
            <span className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            </span>
            <ul className="dropdown-menu dropdown-menu-dark">
              {/* Render delete button only if user is logged in and currentUserId matches authorId */}
              {isLoggedIn && currentUserId === props.author_id && (
                <li><a onClick={() => handleDelete(props.id, props.author_id)} className="dropdown-item" href="/tweets">Delete</a></li>
              )}
              <li><a onClick={() => handleRedirect(props.id)} className="dropdown-item">View</a></li>
            </ul>
          </span>
        </div>

        <pre onClick={() => handleRedirect(props.id)} className="card-text">
          {showAll ? props.text : `${props.text.slice(0, maxLength)}${props.text.length > maxLength ? '...' : ''}`}
        </pre>

        {props.text.length > maxLength && (
          <p className="show-text" onClick={toggleShowAll}>
            {showAll ? 'show less' : 'show more'}
          </p>
        )}

        {props.url ? ( // Check if props.url exists
          <Image
            onClick={() => handleRedirect(props.id)}
            className="img-fluid tweet-img"
            src={props.url}
            width={500}
            height={500}
            quality={100}
            alt="Tweet Image"
            priority={true}
          />
        ) : null}
      </div>
      <div className="engagement-container ">
        <span className="like-tweet engagement-count"><FontAwesomeIcon icon={faHeart} style={{ fontSize: 16, color: "orangered" }} /> </span>
        <span onClick={() => handleRedirect(props.id)} className="comment-tweet engagement-count"><FontAwesomeIcon icon={faComment} style={{ fontSize: 16 }} /> </span>
        <span className="engagement-count retweet"><FontAwesomeIcon icon={faRetweet} style={{ fontSize: 16, color: "whitesmoke" }} /> </span>
        <p className="like-count">370,602k likes</p>
      </div>
    </div>

  )
}
