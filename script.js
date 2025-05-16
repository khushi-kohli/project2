document.addEventListener("DOMContentLoaded", function () {
  const searchbutton = document.getElementById("searchbutton");
  const userinput = document.getElementById("userinput");
  const statscontainer = document.getElementById("statscontainer");
  const easyprogresscircle = document.querySelector(".easyprogress");
  const mediumprogresscircle = document.querySelector(".mediumprogress");
  const hardprogresscircle = document.querySelector(".hardprogress");
  const easylabel = document.getElementById("easylabel");
  const mediumlabel = document.getElementById("mediumlabel");
  const hardlabel = document.getElementById("hardlabel");
  const cardstatscontainer = document.getElementById("statscard");

  function validateusername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_]{1,16}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert("Invalid username");
      userinput.focus();  // Focus on the input field for correction
    }
    return isMatching;
  }

  async function fetchuserdetails(username) {
    try {
      searchbutton.textContent = "Searching...";
      searchbutton.disabled = true;

      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://leetcode.com/graphql/';

      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
        variables: { "username": `${username}` }
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };
      const response = await fetch(proxyUrl + targetUrl, requestOptions);
      if (!response.ok) {
        throw new Error("Unable to fetch the user details");
      }
      const parsedData = await response.json();
      console.log("Logging data:", parsedData);
      displayUserdata(parsedData);
    } 
    catch (error) {
      console.error("Error fetching user details:", error);
      statscontainer.innerHTML = "<p>No data found</p>";
    } finally {
      searchbutton.textContent = "Search";
      searchbutton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserdata(parsedData) {
    const totalQues = parsedData.data.allQuestionsCount[0].count;
    const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
    const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
    const totalHardQues = parsedData.data.allQuestionsCount[3].count;

    const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(solvedTotalEasyQues, totalEasyQues, easylabel, easyprogresscircle);
    updateProgress(solvedTotalMediumQues, totalMediumQues, mediumlabel, mediumprogresscircle);
    updateProgress(solvedTotalHardQues, totalHardQues, hardlabel, hardprogresscircle);

    statscontainer.style.display = "block";  // Show the stats container after data is loaded
  }

  searchbutton.addEventListener("click", function () {
    const username = userinput.value;
    console.log("Logging username:", username);
    if (validateusername(username)) {
      fetchuserdetails(username);
    }
  });
});
