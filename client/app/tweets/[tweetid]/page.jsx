"use client"
import { useState, useEffect } from "react";
import axios from 'axios';
import { useParams } from "next/navigation";
import TweetContainer from "@/components/tweet/tweetContainer";
import CommentSection from "@/components/tweet/commentSection";
import NewComment from "@/components/new/newComment";
import { useUserContext } from '../../context/userLog';
import "./tweetid.css";
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";


export default function TweetPage() {

  //global state to check if user is logged in or not
  const { isLoggedIn, setIsLoggedIn } = useUserContext();

  //get token and see if a user is loggged in 
  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);
  //handling routing 
  const router = useRouter();

  //keeping track of id state
  const [tweets, setTweets] = useState(); //possible initialize with null later on as undefined might not be appropriate
  //keep track of comment state 
  const [comments, setComments] = useState();

  //get tweet id from params 
  const { tweetid } = useParams();

  // Fetch tweet data based on the 'tweetid' and display it
  useEffect(() => {
    axios.get(`http://localhost:4000/api/tweets/${tweetid}`)
      .then((res) => {
        setTweets(res.data);
      })
      .catch((error) => {
        console.error("Error fetching tweets:", error);
        setTweets(null); // Set tweets state to null on error
      });
  }, [tweetid]); // Include tweetid in the dependency array to re-fetch when it changes


  // Fetch comments based on the 'tweetid' and display it
  useEffect(() => {
    axios.get(`http://localhost:4000/api/comments/${tweetid}`)
      .then((res) => {
        setComments(res.data);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
        setComments(null); // Set comments state to null on error
      });
  }, [tweetid]);// Include tweetid in the dependency array to re-fetch when it changes


  //add tweet to database function
  async function addComment(comments) {
    try {
      const token = localStorage.getItem('token');
      // Set the Authorization header with the JWT token
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' // You can set other headers if needed
      };

      const res = await axios.post(`http://localhost:4000/api/comments/${tweetid}`, {
        comment: comments.comment,
      }, { headers }); // Pass headers as a third argument to axios.post()

      // Fetch updated tweets after successful addition
      const updatedCommentsResponse = await axios.get(`http://localhost:4000/api/comments/${tweetid}`);
      setComments(updatedCommentsResponse.data); // Update local state with the updated comments

    } catch (error) {
      console.log(error)
    }
  }

  //handle redirect back to tweets page 
  function handlePostRedirect() {
    router.push('/tweets')
  }

  // Loading state while fetching data (error handling)
  if (!tweets) {
    return (<div>
      <h3 className="id-error-header">This Page does not exist</h3>
      <p className="id-error-txt">We could not find the page you are looking for</p>
    </div>);
  }

  return (
    <div className="tweet-container">
      <div className="backbtn">
        <span onClick={handlePostRedirect} className="back-logo"><FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 15, color: "whitesmoke" }} />   </span>
        <span className="back-text">Go back to post </span>
      </div>

      {/* Display the fetched tweet */}
      <TweetContainer
        id={tweets._id}
        name={tweets.author.name}
        username={tweets.author.username}
        text={tweets.text}
        url={tweets.image}
        author_id={tweets.author._id}
        time={tweets.createdAt}
      />
      {/* render create tweet form if user is logged in or not */}
      {isLoggedIn ? (
        <NewComment addComment={addComment} />
      ) : null}

      {/* displays comments under tweet */}

      <div className="comment-header">
        <span>View all comments ...</span>
      </div>


      {/* mapping through comments and rendering them */}
      <div className="comment-sec-hd">
      {!!comments ? (
        comments.map((newcomment, i) => (
          <CommentSection
            key={i}
            name={newcomment.author.name}
            username={newcomment.author.username}
            text={newcomment.comment}
            time={newcomment.createdAt}
          />
        ))
      ) : null}
      </div>
     
    </div>
  );
}