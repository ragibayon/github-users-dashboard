import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [githubRepos, setGithubRepos] = useState(mockRepos);
  const [githubFollowers, setGithubFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    show: false,
    msg: "",
  });

  const searchGithubUser = async (user) => {
    try {
      setIsLoading(true);
      toggleError();
      let response = await axios(`${rootUrl}/users/${user}`);
      checkRequest();
      setGithubUser(response.data);

      const { followers_url, repos_url } = response.data;

      // repos
      // response = await axios(`${repos_url}/repos?per_page=100`);
      // setGithubRepos(response.data);

      // followers
      // response = await axios(`${followers_url}?per_page=100`);
      // setGithubFollowers(response.data);

      const [reposResponse, followersResponse] = await Promise.allSettled([
        axios(`${repos_url}?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ]);

      if (reposResponse.status === "fulfilled") {
        setGithubRepos(reposResponse.value.data);
      }
      if (followersResponse.status === "fulfilled") {
        setGithubFollowers(followersResponse.value.data);
      }

      setIsLoading(false);
    } catch (err) {
      toggleError(true, "There is no user with that username");
      checkRequest();
      setIsLoading(false);
      console.log(err);
    }
  };

  // check rate
  const checkRequest = async () => {
    try {
      const response = await axios(`${rootUrl}/rate_limit`);
      const data = response.data;
      let {
        rate: { remaining },
      } = data;

      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, "sorry you have reached your hourly rate limit!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleError = (show = false, msg = "") => [setError({ show, msg })];

  useEffect(() => {
    checkRequest();
  }, []);
  return (
    <GithubContext.Provider
      value={{
        githubUser,
        githubRepos,
        githubFollowers,
        requests,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
