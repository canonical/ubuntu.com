console.log("hiya");
const myObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const width = Math.floor(entry.contentRect.width);
    if (width < 1035) {
      entry.target.classList.remove("is-shallow");
      document.getElementById("hero-content").style.marginTop = "2rem";
    } else {
      entry.target.classList.add("is-shallow");
      document.getElementById("hero-content").style.marginTop = "-2rem";
    }
  });
});

const strip = document.querySelector(".p-strip--square-suru");
myObserver.observe(strip);

const linkedinShare = document.querySelector("#linkedin-share");
console.log(linkedinShare);

const cubeCertData = {
  author: "urn:li:person:8675309",
  lifecycleState: "PUBLISHED",
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: "Learning more about LinkedIn by reading the LinkedIn Blog!",
      },
      shareMediaCategory: "ARTICLE",
      media: [
        {
          status: "READY",
          description: {
            text:
              "Official LinkedIn Blog - Your source for insights and information about LinkedIn.",
          },
          originalUrl: "https://blog.linkedin.com/",
          title: {
            text: "Official LinkedIn Blog",
          },
        },
      ],
    },
  },
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS",
  },
};

function handleClick() {
  fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cubeCertData }),
  })
    .then((response) => {
      response.json();
      console.log(response);
    })
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
linkedinShare.addEventListener("click", handleClick);
