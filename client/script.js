const all_hero_ids = []
const filtered_div = document.getElementById("some_hero_div");

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading';
filtered_div.appendChild(loadingIndicator);

// references to the ul
const ul_filtered_heroes = document.createElement("ul");
ul_filtered_heroes.id = "ul_filtered_heroes";
ul_filtered_heroes.className = "hero_section";

fetch('/api/hero')
.then(res => res.json()
.then(heroes => {
    heroes.forEach((hero) => {
        all_hero_ids.push(hero.id);
        fetch(`/api/hero_power/${hero.id}`)
        .then(res => res.json()
        .then(powers => {
            
            const li = document.createElement('li');
            li.className = 'hero_block';

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
                <b>Powers:</b> ${powers.join(", ")}`;

            li.innerHTML = heroInfo;
            ul_filtered_heroes.appendChild(li);
        }));
    });
    // Remove the loading indicator
    filtered_div.removeChild(loadingIndicator);
    filtered_div.appendChild(ul_filtered_heroes);
})); 

console.log(all_hero_ids)

// function to handle enter key being pressed
function handleEnter(event,buttonType) {
    if (event.key == "Enter") {
        switch (buttonType) {
            case "name":
                searchByName();
                break;
            case "race":
                searchByRace();
                break;
            case "publisher":
                searchByPublisher();
                break;
            case "power":
                searchByPower();
                break;
            default:
                break;
        };
    }
}

//search by name
function searchByName() {
    const searched_name = document.getElementById('searchbar_name').value;
    if (searched_name.length) {    
        fetch(`/api/hero_pattern/name/${searched_name}`)
        .then(res => res.json()
        .then(hero_id => {
            populateDiv(hero_id,'Name');
        }));
    } else {
        populateDiv(all_hero_ids);
    }
}

function searchByRace() {
    const searched_race = document.getElementById('searchbar_race').value;
    if (searched_race.length) {
        fetch(`/api/hero_pattern/Race/${searched_race}`)
        .then(res => res.json()
        .then(hero_id => {
            populateDiv(hero_id,'Race');
        }));
    } else {
        populateDiv(all_hero_ids);
    }
}

function searchByPublisher() {
    const searched_publisher = document.getElementById('searchbar_publisher').value;
    if (searched_publisher.length) {
        fetch(`/api/hero_pattern/Publisher/${searched_publisher}`)
        .then(res => res.json()
        .then(hero_id => {
            populateDiv(hero_id,'Publisher');
        }));
    } else {
        populateDiv(all_hero_ids);
    }
}

function searchByPower() {
    const searched_power = document.getElementById('searchbar_power').value;
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
                    populateDiv(hero_id,'Power');
                } else {
                    if (!searched_power) {
                        populateDiv(all_hero_ids)
                    } else {
                        populateDiv()
                    }
                }
            });
    });
}

function sortBy(condition) {
    let i_sorter = 0
    if (condition == 'name') {i_sorter=1;}
    else if (condition == 'race') {i_sorter=4;}
    else if (condition == 'publisher') {i_sorter=7;}
    else if (condition == 'power') {i_sorter=11;}

    const hero_blocks = document.querySelectorAll('.hero_block');
    console.log(hero_blocks);
    const hero_objs = {};
    for (block of hero_blocks) {
        const lines = block.textContent.split('\n');
        const id = lines[0].trim().split(':')[1].trim();
        const sorter = lines[i_sorter].trim().split(':')[1].trim();
        hero_objs[id] = sorter;
    }

    const keyValueArray = Object.entries(hero_objs);
    keyValueArray.sort((a,b) => a[1].localeCompare(b[1]));
    const sortedkeys = keyValueArray.map(pair => Number(pair[0]));
    console.log(sortedkeys);
    populateDiv(sortedkeys);
}



function populateDiv(hero_id = [],search_method='') {
    // clear the div from previous events
    while (filtered_div.firstChild) {
        filtered_div.removeChild(filtered_div.firstChild);
    }

    if (search_method.length) {
        const p_title = document.createElement('p');
        p_title.className = 'div_title';
        p_title.innerText = 'Search By '+search_method;
        filtered_div.appendChild(p_title);
    }

    // add loadingIndicator
    filtered_div.appendChild(loadingIndicator);

    // Create an array of promises for each hero fetch
    const fetchPromises = hero_id.map((id) =>
        fetch(`/api/hero/${id}`)
            .then((res) => res.json())
    );

    // Wait for all promises to resolve
    Promise.all(fetchPromises)
        .then((heroes) => {
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
}