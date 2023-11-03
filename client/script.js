var ul_all_heroes = document.createElement("ul")
ul_all_heroes.id = "ul_all_heroes"
ul_all_heroes.className = "hero_section"

fetch('/api/hero')
.then(res => res.json()
.then(heroes => {
    heroes.forEach((hero) => {
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
            ul_all_heroes.appendChild(li);
        }));
    });
    const parentDiv = document.getElementById('all_hero_div');
    parentDiv.appendChild(ul_all_heroes);
}));


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
    fetch(`/api/hero_pattern/name/${searched_name}`)
    .then(res => res.json()
    .then(hero_id => {
        populateDiv('Name',hero_id);
    }));
}

function searchByRace() {
    const searched_race = document.getElementById('searchbar_race').value;
    fetch(`/api/hero_pattern/Race/${searched_race}`)
    .then(res => res.json()
    .then(hero_id => {
        populateDiv('Race',hero_id);
    }));
}

function searchByPublisher() {
    const searched_publisher = document.getElementById('searchbar_publisher').value;
    fetch(`/api/hero_pattern/Publisher/${searched_publisher}`)
    .then(res => res.json()
    .then(hero_id => {
        populateDiv('Publisher',hero_id);
    }));
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
        console.log(hero_names)
        hero_names.forEach((h_name) => {
            const fetchPromise = fetch(`/api/hero_pattern/name/${h_name}`)
                .then(res => res.json());
            
            fetchPromises.push(fetchPromise);
        });

        Promise.all(fetchPromises)
            .then(h_ids => {
                // Now, hero_id should be populated
                hero_id = h_ids;
                console.log(hero_id);
                populateDiv('Power', hero_id);
            });
    });
}

// references to the div block
const filtered_div = document.getElementById("some_hero_div")
filtered_div.style.display = 'none';

function populateDiv(search_method,hero_id = []) {
    // clear the div from previous events
    while (filtered_div.firstChild) {
        filtered_div.removeChild(filtered_div.firstChild);
    }
    
    // check if search is empty to hide div, otherwise show
    if (hero_id.length == 0) {
        filtered_div.style.display = 'none';
    } else {
        filtered_div.style.display = 'block';
    }

    const p_title = document.createElement('p');
    p_title.className = 'div_title'
    p_title.innerText = 'Search By '+search_method;
    filtered_div.appendChild(p_title);

    const ul_filtered_heroes = document.createElement("ul")
    ul_filtered_heroes.id = "ul_filtered_heroes"
    ul_filtered_heroes.className = "hero_section"
    filtered_div.appendChild(ul_filtered_heroes);

    hero_id.forEach((id) => {
        console.log(id)
        if (id.length) {
            fetch(`/api/hero/${id}`)
            .then(res => res.json()
            .then(hero => {
                fetch(`/api/hero_power/${id}`)
                .then(res => res.json()
                .then(h_power => {
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
                        <b>Powers:</b> ${h_power.join(", ")}`;

                    li.innerHTML = heroInfo;
                    ul_filtered_heroes.appendChild(li);
                }));  
            })); 
        }
    });

}