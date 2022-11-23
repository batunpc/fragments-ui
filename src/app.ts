// src/app.js

import authHandler from "../utils/index";

import {
  getFragmentById,
  getUserFragments,
  postFragment,
  deleteFragment,
} from "./api";

async function init() {
  const user = await authHandler(); // User info

  if (user) createFragmentCard();

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

    const fragment = await postFragment(user, fragmentType, fragmentData);

    createFragmentCard();
    fragmentInput.value = "";
    console.log("Fragment created", { fragment });
    console.log(`Posted fragment of type ${fragmentType}`);
  });

  function createFragmentCard() {
    const listOfFragments = getUserFragments(user, true);
    listOfFragments.then((data) => {
      const metadataCard = document.querySelector(
        "#metadataCard"
      ) as HTMLElement;
      metadataCard.innerHTML = "";
      console.log("current metadata: ", data?.fragments.fragments);
      data?.fragments.fragments.forEach((fragment: any) => {
        const fragmentDiv = document.createElement("div");
        fragmentDiv.setAttribute(
          "style",
          `color: #233142;
           background-color: #DBE2EF;
           margin: 10px; 
           padding: 10px; 
           width: 95%; 
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
        // == Delete button == //
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("class", "btn btn-danger btn-sm");
        deleteBtn.setAttribute("style", "float: right;");
        deleteBtn.innerHTML = "Delete Fragment";
        deleteBtn.addEventListener("click", async () => {
          await deleteFragment(user, fragment.id);
          createFragmentCard();
        });
        fragmentDiv.appendChild(deleteBtn);

        // == View Fragment button == //
        const getDataBtn = document.createElement("button");
        getDataBtn.setAttribute("class", "btn btn-dark btn-sm");
        getDataBtn.setAttribute("style", "float: right; margin-right: 10px;");
        getDataBtn.innerHTML = "View Fragment ";
        const fragmentDataDiv = document.createElement("div");
        fragmentDataDiv.setAttribute(
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
            border: 3px solid #103664;
            font-size: 17px;
            display: none;`
        );

        getDataBtn.addEventListener("click", async () => {
          const fragmentData = await getFragmentById(user, fragment.id);
          //console.log("Fragment Data", fragmentData);
          fragmentDataDiv.innerHTML = `<span> Fragment Data:</span> ${fragmentData}<br>`;
          // add label for fragmentTypeDropdown
          const fragmentTypeLabel = document.createElement("label");
          fragmentTypeLabel.setAttribute("for", "fragment-type-dropdown");
          fragmentTypeLabel.innerHTML = "Select type to convert : ";
          fragmentDataDiv.appendChild(fragmentTypeLabel);
          // add dropdown menu to select fragment type
          const fragmentTypeDropdown = document.createElement("select");
          fragmentTypeDropdown.setAttribute("id", "fragment-type-dropdown");
          fragmentTypeDropdown.setAttribute(
            "style",
            "margin: 5px 10px; padding: 10px; width: 90%;"
          );
          fragmentTypeDropdown.innerHTML = `<option value=".txt">text/plain</option>
                                            <option value=".html">text/html</option>
                                            <option value=".md">text/markdown</option>
                                            <option value=".js">application/json</option>`;
          fragmentDataDiv.appendChild(fragmentTypeDropdown);

          // ADD CONVERT BUTTON
          const convertBtn = document.createElement("button");
          convertBtn.setAttribute("class", "btn btn-info btn-sm");
          convertBtn.setAttribute("style", "float: right; margin-right: 10px;");
          convertBtn.innerHTML = "Convert Fragment";
          convertBtn.addEventListener("click", async () => {
            const fragmentType = fragmentTypeDropdown.value;
            console.log("Fragment Type", fragmentType);

            getFragmentById(user, fragment.id, fragmentType).then((data) => {
              console.log("Converted Fragment", data);
              fragmentDataDiv.innerHTML = `Converted to ${fragmentType}: ${data}`;
              fragmentDataDiv.innerHTML = fragmentDataDiv.innerHTML.replace(
                /</g,
                "&lt;"
              );
              fragmentDataDiv.innerHTML = fragmentDataDiv.innerHTML.replace(
                />/g,
                "&gt;"
              );
              if (!data) {
                fragmentDataDiv.innerHTML = "415: Unsupported Media Type";
              }
            });
          });
          fragmentDataDiv.appendChild(convertBtn);

          fragmentDiv.appendChild(fragmentDataDiv);
          // toggle button to hide and show fragment data
          if (fragmentDataDiv.style.display === "none") {
            fragmentDataDiv.style.display = "block";
            getDataBtn.innerHTML = "Hide Fragment";
          } else {
            fragmentDataDiv.style.display = "none";
            getDataBtn.innerHTML = "View Fragment ";
          }
        });

        fragmentDiv.appendChild(getDataBtn);

        metadataCard.appendChild(fragmentDiv);

        fragmentDiv.querySelectorAll("span").forEach((span) => {
          span.setAttribute(
            "style",
            ` color: #3F72AF; font-weight: 700; font-family: 'Courier New', Courier, monospace;`
          );
        });

        fragmentDiv.querySelectorAll("i").forEach((i) => {
          i.setAttribute(
            "style",
            // fragment id and content-type
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
