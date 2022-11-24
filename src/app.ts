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
  createFragmentCard();
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

    const fragmentType = fragmentTypeDropdown.value;
    const fragmentData = fragmentInput.value.trim();

    await postFragment(user, fragmentType, fragmentData);
    createFragmentCard();
    fragmentInput.value = "";
    console.log(`Posted fragment of type ${fragmentType}`);
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
      const metadataCard = document.querySelector(
        "#metadataCard"
      ) as HTMLElement;
      metadataCard.innerHTML = "";
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

        const formattedDate = new Date(fragment.created).toLocaleString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );

        fragmentDiv.innerHTML = `<span> Fragment ID:</span> <i> ${fragment.id} </i> <br>
                                <span> Content-Type:</span> <i>${fragment.type}</i> <br>
                                <span> Fragment Size:</span> ${fragment.size}  <br>
                                <span> Created:</span> ${formattedDate}  `;
        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute(
          "style",
          ` margin-top: 5px;
            padding: 10px;
            width: 30%;
            overflow: scroll;
            display: inline-block;
            vertical-align: top;
            text-align: center;
            border-radius: 25px;
            font-size: 15px;
            float: right;`
        );
        deleteBtn.innerHTML = "Delete Fragment";
        // TODO: Add delete functionality
        // deleteBtn.addEventListener("click", () => {
        //   deleteFragment(fragment.id);
        //   createFragmentCard();
        // });
        fragmentDiv.appendChild(deleteBtn);

        fragmentDiv.querySelectorAll("span").forEach((span) => {
          span.setAttribute(
            "style",
            " color: #3F72AF; font-weight: 700; font-family: 'Courier New', Courier, monospace;"
          );
        });
        fragmentDiv.querySelectorAll("i").forEach((i) => {
          i.setAttribute(
            "style",
            /* fragment id  */
            "background-color: #3C4048; color: #00ABB3; padding: 2px 5px; border-radius: 5px; font-weight: 500;"
          );
        });

        metadataCard?.appendChild(fragmentDiv);
      });
    });
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
