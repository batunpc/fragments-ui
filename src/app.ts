// src/app.js

import { Auth, getUser } from "./auth";
import { getFragmentById, getUserFragments, postFragment } from "./api";

const authHandler = async () => {
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const userSection = document.querySelector("#user");
  const user = await getUser();
  loginBtn
    ? loginBtn.addEventListener("click", () => Auth.federatedSignIn())
    : null;
  logoutBtn ? logoutBtn.addEventListener("click", () => Auth.signOut()) : null;
  if (!user) {
    logoutBtn?.setAttribute("disabled", "true");
    return;
  }
  console.log({ user });
  userSection?.attributes.removeNamedItem("hidden");
  loginBtn?.setAttribute("disabled", "true");
  userSection
    ?.querySelector(".username")
    ?.appendChild(document.createTextNode(user?.username));
  loginBtn?.classList.add("hidden");
  // Do an authenticated request to the fragments API server and log the result

  return user;
};

async function init() {
  const user = await authHandler(); // User info

  // Form where fragment is created
  const createFragmentForm = document.getElementById("create-fragment-form");

  // Dropdown menu to select fragment type
  const fragmentTypeDropdown = document.getElementById(
    "fragment-type-dropdown"
  ) as HTMLSelectElement;

  // Textarea where fragment data is written
  const fragmentInput = document.getElementById(
    "fragmentData"
  ) as HTMLInputElement;

  // == POST == //
  createFragmentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    // check if element is null
    const fragmentType = fragmentTypeDropdown.value;
    const fragmentData = fragmentInput.value.trim();

    postFragment(user, fragmentType, fragmentData);

    fragmentInput.value = "";
    console.log("Fragment created");
  });

  // // CONVERT: Convert Form and Fragment ID
  // const convertForm = document.querySelector("#convert-form");
  // const convertFragmentIdInput = document.querySelector(
  //   "#convert-fragment-id-input"
  // ) as HTMLInputElement; // ENTER fragment id here
  // const convertFragmentType = document.querySelector(
  //   "#convert-fragment-type"
  // ) as HTMLSelectElement; // SELECT fragment type here

  // fragmentForm?.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   //postFragment(user, fragmentType.value, fragmentInput.value);
  //   postFragment(user, fragmentType.value, fragmentInput.value);
  //   createFragmentCard();
  // });

  // convertForm?.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   getFragmentById(
  //     user,
  //     convertFragmentIdInput.value,
  //     convertFragmentType.value
  //   );
  // });

  function createFragmentCard() {
    const listOfFragments = getUserFragments(user, true);
    listOfFragments.then((data) => {
      const fragmentCards = document.querySelector("#fragmentCards");

      data?.fragments.data.forEach((fragment: any) => {
        const fragmentDiv = document.createElement("div");
        fragmentDiv.setAttribute(
          "style",
          `color: #233142;
           background-color: #DBE2EF;
           margin: 10px; 
           padding: 10px; 
           width: 90%; 
           overflow: scroll; 
           display: inline-block; 
           vertical-align: top; 
           text-align: left; 
           border-radius: 20px; 
           border: 5px solid #103664; 
           font-size: 17px;`
        );
        // add style bold to every span in fragmentDiv

        const formattedDate = new Date(fragment.created).toLocaleString();
        fragmentDiv.innerHTML = `<span> Fragment ID:</span> <i> ${fragment.id} </i> <br>
                                <span> Content-Type:</span> ${fragment.type}   <br>
                                <span> Fragment Size:</span> ${fragment.size}  <br>
                                <span> Created:</span> ${formattedDate}  `;

        fragmentDiv.querySelectorAll("span").forEach((span) => {
          span.setAttribute(
            "style",
            " color: #3F72AF; font-weight: 700; font-family: 'Courier New', Courier, monospace;"
          );
        });
        fragmentDiv.querySelectorAll("i").forEach((i) => {
          i.setAttribute(
            "style",
            /* code block */
            "background-color: #313131; color: #c7c7c7; padding: 4px; border-radius: 5px; color: #ECECEC;"
          );
        });
        fragmentCards?.appendChild(fragmentDiv);
      });
    });
  }
  createFragmentCard();
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
