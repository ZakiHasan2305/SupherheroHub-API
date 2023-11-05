const filtered_div = document.getElementById("some_hero_div");

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading';

// references to the ul
const ul_filtered_heroes = document.createElement("ul");
ul_filtered_heroes.id = "ul_filtered_heroes";
ul_filtered_heroes.className = "hero_section";

// fetch('/api/hero')
// .then(res => res.json()
// .then(heroes => {
//     heroes.forEach((hero) => {
//         all_hero_ids.push(hero.id);
//         fetch(`/api/hero_power/${hero.id}`)
//         .then(res => res.json()
//         .then(powers => {
            
//             const li = document.createElement('li');
//             li.className = 'hero_block';

//             let heroInfo = 
//                 `<b>id:</b> ${hero.id}<br>
//                 <b>name:</b> ${hero.name}<br>
//                 <b>Gender:</b> ${hero.Gender}<br>
//                 <b>Eye Color:</b> ${hero['Eye color']}<br>
//                 <b>Race:</b> ${hero.Race}<br>
//                 <b>Hair Color:</b> ${hero['Hair color']}<br>
//                 <b>Height:</b> ${hero.Height}<br>
//                 <b>Publisher:</b> ${hero.Publisher}<br>
//                 <b>Skin Color:</b> ${hero['Skin color']}<br>
//                 <b>Alignment:</b> ${hero.Alignment}<br>
//                 <b>Weight:</b> ${hero.Weight}<br>
//                 <b>Powers:</b> ${powers.join(", ")}`;

//             li.innerHTML = heroInfo;
//             ul_filtered_heroes.appendChild(li);
//         }));
//     });
//     // Remove the loading indicator
//     filtered_div.removeChild(loadingIndicator);
//     filtered_div.appendChild(ul_filtered_heroes);
// })); 

function clearElement(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function restrictInput(event) {
    const inputField = document.getElementById("hero_input");
    const value = inputField.value;
    const newValue = value.replace(/[^0-9,]/g, ''); // Remove non-numeric characters
    inputField.value = newValue;
}

function searchBy(field,element_id) {
    const pattern = document.getElementById(element_id).value;
    if (pattern) {
        fetch(`/api/hero_pattern/${field}/${pattern}`)
        .then(res => res.json()
        .then(hero_id => {
            console.log(hero_id);
            populateDiv(hero_id,`Search by ${field}`);
        }));
    } else {
        populateDiv();
    }
}

function searchByPower(element_id) {
    const searched_power = document.getElementById(element_id).value;
    fetch("/api/hero_power")
    .then(res => res.json())
    .then(all_powers => {
        let hero_id = [];
        const fetchPromises = [];

        hero_names = all_powers.filter(hero => hero[searched_power] === "True")
                    .map(hero => hero.hero_names);
        hero_names.forEach((h_name) => {
            const fetchPromise = fetch(`/api/hero_pattern/name/${h_name}`)
                .then(res => res.json());
            
            fetchPromises.push(fetchPromise);
        });

        Promise.all(fetchPromises)
            .then(h_ids => {
                // Now, hero_id should be populated
                hero_id = [].concat(...h_ids);
                if (hero_id.length) {
                    console.log(typeof hero_id);
                    populateDiv(hero_id,'Search by Power');
                } else {
                    populateDiv()
                }
            });
    });
}

function sortBy(condition) {
    let i_sorter = 0
    if (condition == 'name') {i_sorter=1;}
    else if (condition == 'Race') {i_sorter=4;}
    else if (condition == 'Publisher') {i_sorter=7;}
    else if (condition == 'Power') {i_sorter=11;}

    const hero_blocks = document.querySelectorAll('.hero_block');
    console.log(hero_blocks);
    const hero_objs = {};
    for (block of hero_blocks) {
        const lines = block.textContent.split('\n');
        const id = lines[0].trim().split(':')[1].trim();
        const sorter = lines[i_sorter].trim().split(':')[1].trim();
        hero_objs[id] = sorter;
    }
    console.log(hero_objs)
    const keyValueArray = Object.entries(hero_objs);
    keyValueArray.sort((a,b) => a[1].localeCompare(b[1]));
    console.log(keyValueArray)
    const sortedkeys = keyValueArray.map(pair => Number(pair[0]));
    console.log(sortedkeys);
    populateDiv(sortedkeys,`Sort by ${condition}`);
}

function createList(element_id) {
    
}

function displayList(element_id) {

}

function updateList(element_id) {

}

function deleteList(element_id) {

}

function populateDiv(hero_id = [],message='') {
    // clear the div from previous events
    clearElement(filtered_div);
    clearElement(ul_filtered_heroes);

    const p_title = document.createElement('p');
    p_title.className = 'status_message';
    p_title.innerText = message;
    
    if (message.length) {
        filtered_div.appendChild(p_title);
    }

    if (hero_id.length) {
         // add loadingIndicator
        filtered_div.appendChild(loadingIndicator);

        // Create an array of promises for each hero fetch
        const fetchPromises = hero_id.map((id) =>
        fetch(`/api/hero/${id}`)
            .then((res) => res.json())
        );

        // Wait for all promises to resolve
        Promise.all(fetchPromises).then((heroes) => {
            // Fetch hero power for each hero
            const powerPromises = heroes.map((hero) =>
                fetch(`/api/hero_power/${hero.id}`)
                    .then((res) => res.json())
            );

            // Wait for all power promises to resolve
            return Promise.all(powerPromises).then((powers) => {
                heroes.forEach((hero, index) => {
                    const li = document.createElement('li');
                    li.className = 'hero_block';

                    const h_power = powers[index];

                    let heroInfo =
                        `<b>id:</b> ${hero.id}<br>
                        <b>name:</b> ${hero.name}<br>
                        <b>Gender:</b> ${hero.Gender}<br>
                        <b>Eye Color:</b> ${hero['Eye color']}<br>
                        <b>Race:</b> ${hero.Race}<br>
                        <b>Hair Color:</b> ${hero['Hair color']}<br>
                        <b>Height:</b> ${hero.Height}<br>
                        <b>Publisher:</b> ${hero.Publisher}<br>
                        <b>Skin Color:</b> ${hero['Skin color']}<br>
                        <b>Alignment:</b> ${hero.Alignment}<br>
                        <b>Weight:</b> ${hero.Weight}<br>
                        <b>Powers:</b> ${h_power.join(", ")}`;

                    li.innerHTML = heroInfo;
                    ul_filtered_heroes.appendChild(li);
                });
                // Remove the loading indicator
                filtered_div.removeChild(loadingIndicator);
                filtered_div.appendChild(ul_filtered_heroes);
            });
        });
    } else {
        p_title.innerText='No Search Results!'
        filtered_div.appendChild(p_title);
    }
}